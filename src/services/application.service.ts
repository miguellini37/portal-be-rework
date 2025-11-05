import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, FindOptionsWhere } from 'typeorm';
import { Application, ApplicationStatus, TERMINAL_STATUSES } from '../entities/Application';
import { IApplicationInput, ICreateApplicationInput } from '../models/application.model';
import { Job } from '../entities/Job';
import { Athlete } from '../entities/Athlete';
import { ActivityService } from './activity.service';
import { ActivityType } from '../entities/Activity';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(Athlete)
    private athleteRepository: Repository<Athlete>,
    private activityService: ActivityService
  ) {}

  async createApplication(athleteId: string, createApplicationInput: ICreateApplicationInput) {
    const { jobId } = createApplicationInput;
    if (!jobId || !athleteId) {
      throw new BadRequestException('jobId and athleteId are required');
    }

    const job = await this.jobRepository.findOneBy({ id: jobId });
    const athlete = await this.athleteRepository.findOneBy({ id: athleteId });
    if (!job || !athlete) {
      throw new NotFoundException('Job or Athlete not found');
    }

    const existing = await this.applicationRepository.findOne({
      where: { job: { id: jobId }, athlete: { id: athleteId } },
    });
    if (existing) {
      throw new ConflictException('You have already applied to this job.');
    }

    const application = this.applicationRepository.create({ job, athlete });
    await this.applicationRepository.save(application);
    await this.activityService.createActivity(athlete.id, ActivityType.APPLICATION, {
      applicationId: application.id,
      message: 'Application created successfully',
    });
    return { message: 'Application created successfully' };
  }

  async getApplications(userId: string, companyId?: string, jobId?: string) {
    if (!userId && !companyId) {
      throw new BadRequestException('Missing user id');
    }

    const whereCondition: FindOptionsWhere<Application> = companyId
      ? this.buildJobQueryForCompany(companyId, jobId)
      : this.buildJobQueryForAthlete(userId, jobId);

    const applications = await this.applicationRepository.find({
      where: whereCondition,
      relations: ['job', 'job.company', 'athlete', 'interview'],
      order: { creationDate: 'DESC' },
    });

    return applications;
  }

  async updateApplicationStatus(
    userId: string,
    companyId: string | undefined,
    input: IApplicationInput
  ) {
    const { id, status } = input;
    if (!id) {
      throw new BadRequestException('application id is required');
    }
    if (!status) {
      throw new BadRequestException('Application status is required');
    }

    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['job', 'job.company', 'athlete', 'interview'],
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    if (!Object.values(ApplicationStatus).includes(status)) {
      throw new BadRequestException('Invalid application status');
    }

    const isApplicant = application.athlete?.id === userId;
    const isCompanyOwner = Boolean(companyId && application.job?.company?.id === companyId);

    if (status === ApplicationStatus.withdrawn) {
      // Allow athlete (applicant) or company owner to withdraw
      if (!isApplicant) {
        throw new ForbiddenException('Only the applicant can withdraw this application');
      }
    } else {
      // Other status transitions are company-only
      if (!isCompanyOwner) {
        throw new ForbiddenException('Company account required to update status');
      }
    }

    application.status = status;
    if (TERMINAL_STATUSES.includes(status)) {
      application.terminalStatusDate = new Date();
    }
    await this.applicationRepository.save(application);

    await this.activityService.createActivity(application.athlete.id, ActivityType.APPLICATION, {
      applicationId: application.id,
      message: 'Application status updated to ' + status.trim().replace(/_/g, ' '),
    });

    return application;
  }

  // Company: validate job ownership when jobId provided and filter withdrawn
  private buildJobQueryForCompany(
    companyId: string,
    jobId?: string
  ): FindOptionsWhere<Application> {
    if (!companyId) {
      throw new BadRequestException('Company id is required');
    }

    const where: FindOptionsWhere<Application> = {
      job: {
        ...(jobId ? { id: jobId } : {}),
        company: { id: companyId },
      },
      status: Not(ApplicationStatus.withdrawn),
    };

    return where;
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
      athlete: { id: athleteId },
    };

    if (jobId) {
      Object.assign(where, { job: { id: jobId } as Job });
    }

    return where;
  }
}
