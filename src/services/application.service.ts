import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, FindOptionsWhere } from 'typeorm';
import { Application, ApplicationStatus, IApplicationInput } from '../entities/Application';
import { Job } from '../entities/Job';
import { Athlete } from '../entities/Athlete';
import { sanitizeUser, sanitizeApplication } from './auth/utils';

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
    if (!jobId || !athleteId) {
      throw new BadRequestException('jobId and athleteId are required');
    }

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

    const whereCondition: FindOptionsWhere<Application> = companyRefId
      ? await this.buildJobQueryForCompany(companyRefId, jobId)
      : this.buildJobQueryForAthlete(userId, jobId);

    const applications = await this.applicationRepository.find({
      where: whereCondition,
      relations: ['job', 'job.company', 'athlete'],
      order: { creationDate: 'DESC' },
    });

    const mapSanitize = (app: Application, dropJob = false) => {
      const sanitized = dropJob ? sanitizeApplication(app) : { ...app };
      sanitized.athlete = sanitizeUser(sanitized.athlete);
      return sanitized;
    };

    if (jobId) {
      return applications.map((app) => mapSanitize(app, true));
    }

    return applications.map((app) => mapSanitize(app, false));
  }

  async updateApplicationStatus(
    userId: string,
    companyRefId: string | undefined,
    input: IApplicationInput
  ) {
    const { id, status } = input;
    if (!id) throw new BadRequestException('application id is required');

    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['job', 'job.company', 'athlete'],
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    if (!status) {
      throw new BadRequestException('Application status is required');
    }
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

    return {
      ...application,
      athlete: sanitizeUser(application.athlete),
    };
  }

  // Company: validate job ownership when jobId provided and filter withdrawn
  private async buildJobQueryForCompany(
    companyRefId: string,
    jobId?: string
  ): Promise<FindOptionsWhere<Application>> {
    if (!companyRefId) throw new BadRequestException('Company id is required');

    if (jobId) {
      const job = await this.jobRepository.findOne({
        where: { id: jobId },
        relations: ['company'],
      });
      if (!job) {
        throw new NotFoundException('Job not found');
      }
      if (job.company?.id !== companyRefId) {
        throw new ForbiddenException('Job does not belong to your company');
      }
    }

    return {
      job: { ...(jobId ? { id: jobId } : {}), company: { id: companyRefId } },
      status: Not(ApplicationStatus.withdrawn),
    } as FindOptionsWhere<Application>;
  }

  // Athlete: filter by athlete (and optional jobId)
  private buildJobQueryForAthlete(
    athleteId: string,
    jobId?: string
  ): FindOptionsWhere<Application> {
    if (!athleteId) {
      throw new BadRequestException('User id is required');
    }
    const where: FindOptionsWhere<Application> = {
      athlete: { id: athleteId } as Athlete,
    };

    if (jobId) {
      Object.assign(where, { job: { id: jobId } as Job });
    }

    return where;
  }
}
