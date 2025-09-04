import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, FindOptionsWhere } from 'typeorm';
import {
  Application,
  ApplicationStatus,
  IUpdateApplicationStatusInput,
} from '../entities/Application';
import { Job } from '../entities/Job';
import { Athlete } from '../entities/Athlete';
import { sanitizeUser } from './auth/utils';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(Athlete)
    private athleteRepository: Repository<Athlete>
  ) {}

  async createApplication(athleteId: string, createApplicationDto: { jobId: string }) {
    const { jobId } = createApplicationDto;
    if (!jobId || !athleteId) throw new BadRequestException('jobId and athleteId are required');

    const job = await this.jobRepository.findOneBy({ id: jobId });
    const athlete = await this.athleteRepository.findOneBy({ id: athleteId });
    if (!job || !athlete) throw new NotFoundException('Job or Athlete not found');

    const existing = await this.applicationRepository.findOne({
      where: { job: { id: jobId } as Job, athlete: { id: athleteId } as Athlete },
    });
    if (existing) throw new ConflictException('You have already applied to this job.');

    const application = this.applicationRepository.create({ job, athlete });
    await this.applicationRepository.save(application);
    return { message: 'Application created successfully' };
  }

  async getApplications(userId: string, companyRefId?: string, jobId?: string) {
    if (!userId && !companyRefId) throw new BadRequestException('Missing user id');

    if (companyRefId && jobId) {
      const job = await this.jobRepository.findOne({
        where: { id: jobId },
        relations: ['company'],
      });
      if (!job) throw new NotFoundException('Job not found');
      if (job.company?.id !== companyRefId)
        throw new ForbiddenException('Job does not belong to your company');
    }

    let whereCondition: FindOptionsWhere<Application>;
    if (companyRefId) {
      whereCondition = {
        job: { ...(jobId ? { id: jobId } : {}), company: { id: companyRefId } },
        status: Not(ApplicationStatus.withdrawn),
      };
    } else {
      whereCondition = {
        athlete: { id: userId } as Athlete,
        ...(jobId ? { job: { id: jobId } as Job } : {}),
      };
    }

    const applications = await this.applicationRepository.find({
      where: whereCondition,
      relations: ['job', 'job.company', 'athlete'],
      order: { creationDate: 'DESC' },
    });

    return applications.map((app) => ({
      ...app,
      athlete: sanitizeUser(app.athlete),
    }));
  }

  async updateApplicationStatus(
    userId: string,
    companyRefId: string | undefined,
    input: IUpdateApplicationStatusInput
  ) {
    const { id, status } = input;
    if (!id) throw new BadRequestException('application id is required');

    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['job', 'job.company', 'athlete'],
    });
    if (!application) throw new NotFoundException('Application not found');

    if (typeof status !== 'undefined') {
      // Basic validators
      if (!Object.values(ApplicationStatus).includes(status)) {
        throw new BadRequestException('Invalid application status');
      }

      const isApplicant = application.athlete?.id === userId;
      const isCompanyOwner = Boolean(companyRefId && application.job?.company?.id === companyRefId);

      if (status === ApplicationStatus.withdrawn) {
        // Allow athlete (applicant) or company owner to withdraw
        if (!isApplicant && !isCompanyOwner) {
          throw new ForbiddenException(
            'Only the applicant or the company can withdraw this application'
          );
        }
      } else {
        // Other status transitions are company-only
        if (!isCompanyOwner) {
          throw new ForbiddenException('Company account required to update status');
        }
      }

      application.status = status;
      await this.applicationRepository.save(application);
    }

    return {
      ...application,
      athlete: sanitizeUser(application.athlete),
    };
  }
}
