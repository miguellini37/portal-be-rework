import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { Application, ApplicationStatus } from '../entities/Application';
import { Interview, InterviewStatus } from '../entities/Interview';
import {
  ICreateInterviewInput,
  IGetInterviewInput,
  IGetInterviewsInput,
  IUpdateInterviewInput,
} from '../models/interview.models';
import { sanitizeUser } from './auth/utils';
import { IAuthenticatedRequest } from '../models/request.models';
import { USER_PERMISSIONS } from '../constants/user-permissions';
import { ActivityService } from './activity.service'; // ADD
import { ActivityType } from '../entities';

@Injectable()
export class InterviewService {
  constructor(
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    private activityService: ActivityService // ADD
  ) {}

  async createInterview(companyRefId: string | undefined, input: ICreateInterviewInput) {
    const { applicationId, dateTime, location, interviewer, preparationTips } = input;
    if (!applicationId) {
      throw new BadRequestException('applicationId is required');
    }

    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
      relations: ['job', 'job.company', 'athlete', 'interview'],
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    if (application.interview) {
      throw new ConflictException('An interview already exists for this application');
    }
    if (application.job.company?.id !== companyRefId) {
      throw new BadRequestException('Not authorized to create interview for this job');
    }

    const interview = this.interviewRepository.create({
      dateTime: new Date(dateTime),
      location,
      interviewer,
      preparationTips,
      status: InterviewStatus.scheduled,
      job: application.job,
      athlete: application.athlete,
      company: application.job.company,
      application: application,
    });

    await this.interviewRepository.save(interview);

    await this.applicationRepository.save({
      ...application,
      interview: interview,
      status: ApplicationStatus.interview_requested,
    });

    // ACTIVITY: update or create (by interviewId)
    if (application.athlete?.id) {
      await this.activityService.createActivity(application.athlete.id, ActivityType.INTERVIEW, {
        interviewId: interview.id,
        applicationId: application.id,
        message: 'Interview scheduled',
      });
    }

    return this.sanitizeInterview(interview);
  }

  getInterview = async (req: IAuthenticatedRequest, input: IGetInterviewInput) => {
    const interview = await this.interviewRepository.findOne({
      where: this.getInterviewWhereClause(input),
      relations: ['job', 'company', 'athlete'],
    });
    if (!interview) {
      return;
    }
    if (req.user.permission === USER_PERMISSIONS.ATHLETE && interview.athlete?.id !== req.user.id) {
      throw new BadRequestException('Not authorized to view this interview');
    }
    if (
      req.user.permission === USER_PERMISSIONS.COMPANY &&
      interview.company?.id !== req.user.companyRefId
    ) {
      console.log('hiya', interview.company?.id, req.user.companyRefId);
      throw new BadRequestException('Not authorized to view this interview');
    }
    return this.sanitizeInterview(interview);
  };

  getInterviewWhereClause = (input: IGetInterviewInput) => {
    const where: FindOptionsWhere<Interview> = {};

    if (input.interviewId) {
      where.id = input.interviewId;
    }

    if (input.applicationId) {
      where.application = { id: input.applicationId };
    }

    return where;
  };

  async updateInterview(companyRefId: string | undefined, input: IUpdateInterviewInput) {
    if (!input.id) {
      throw new BadRequestException('id is required');
    }

    const interview = await this.interviewRepository.findOne({
      where: { id: input.id },
      relations: [
        'company',
        'athlete',
        'application',
        'application.job',
        'application.job.company',
      ],
    });
    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    if (interview.company?.id !== companyRefId) {
      throw new BadRequestException('Not authorized to update interview');
    }

    const updatedInterview = this.interviewRepository.create({
      ...interview,
      dateTime: input.dateTime ? new Date(input.dateTime) : interview.dateTime,
      location: input.location ?? interview.location,
      interviewer: input.interviewer ?? interview.interviewer,
      preparationTips: input.preparationTips ?? interview.preparationTips,
      status: input.status ?? interview.status,
    });

    await this.interviewRepository.save(updatedInterview);

    // ACTIVITY: update or create (by interviewId)
    if (updatedInterview.athlete?.id) {
      await this.activityService.createActivity(
        updatedInterview.athlete.id,
        ActivityType.INTERVIEW,
        {
          interviewId: updatedInterview.id,
          applicationId: updatedInterview.application?.id,
          message: 'Interview information updated',
        }
      );
    }

    return this.sanitizeInterview(updatedInterview);
  }

  async getInterviews(req: IAuthenticatedRequest, input: IGetInterviewsInput) {
    const where: FindOptionsWhere<Interview> = {};

    if (input.jobId) {
      where.job = { id: input.jobId };
    }
    if (req.user.permission === USER_PERMISSIONS.ATHLETE) {
      where.athlete = { id: req.user.id };
    }

    if (input.dateRange) {
      where.dateTime = Between(new Date(input.dateRange.from), new Date(input.dateRange.to));
    }
    if (input.jobId) {
      where.job = { id: input.jobId };
    }

    if (req.user.permission === USER_PERMISSIONS.COMPANY) {
      where.company = { id: req.user.companyRefId };
    }
    if (req.user.permission === USER_PERMISSIONS.ATHLETE) {
      where.athlete = { id: req.user.id };
    }

    const interviews = await this.interviewRepository.find({
      where,
      relations: ['job', 'company', 'athlete'],
      order: { dateTime: 'ASC' },
    });

    return interviews.map((i) => this.sanitizeInterview(i));
  }

  private sanitizeInterview(interview: Interview) {
    return {
      ...interview,
      athlete: sanitizeUser(interview.athlete),
    };
  }
}
