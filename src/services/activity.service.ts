import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from '../entities/Activity';
import { IActivity, IUpdateActivityInput } from '../models/activity.model';
import { Application } from '../entities/Application';
import { Interview } from '../entities/Interview';
import { User } from '../entities';

// very simple for now, can be expanded
const sanitizeActivity = (activity: Activity): IActivity => {
  const { activityId, type, date } = activity;
  let message = activity.message ?? '';
  if (activity.type === 'application' && activity.application) {
    const { job, status } = activity.application;
    if (job) {
      message =
        message ||
        `Application for ${job.position} at ${job?.company?.companyName} was updated to ${status}`;
    }
  } else if (activity.type === 'interview' && activity.interview) {
    const interviewDate = new Date(activity.interview.dateTime).toLocaleDateString();
    const job = activity.interview.application?.job;
    if (job) {
      message =
        message ||
        `Interview for ${job.position} at ${job?.company?.companyName} scheduled for ${interviewDate}`;
    } else {
      message = message || `Interview scheduled for ${interviewDate}`;
    }
  }
  return {
    activityId,
    type,
    date,
    message,
    application: activity.application,
    interview: activity.interview,
  };
};

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>
  ) {}

  async getRecentActivities(userId: string, limit = 10): Promise<IActivity[]> {
    const activities = await this.activityRepository.find({
      where: { user: { id: userId } },
      relations: [
        'application',
        'application.job',
        'application.job.company',
        'interview',
        'interview.application',
        'interview.application.job',
        'interview.application.job.company',
      ],
      order: { date: 'DESC' },
      take: limit,
    });
    return activities.map(sanitizeActivity);
  }

  async getAllActivities(userId: string): Promise<IActivity[]> {
    const activities = await this.activityRepository.find({
      where: { user: { id: userId } },
      relations: [
        'application',
        'application.job',
        'application.job.company',
        'interview',
        'interview.application',
        'interview.application.job',
        'interview.application.job.company',
      ],
      order: { date: 'DESC' },
    });
    return activities.map(sanitizeActivity);
  }

  async updateActivity(userId: string, input: IUpdateActivityInput): Promise<IActivity> {
    const { activityId, applicationId, interviewId, message, type } = input;

    // Path 1: direct by activityId
    if (activityId) {
      const existing = await this.activityRepository.findOne({
        where: { activityId },
        relations: [
          'user',
          'application',
          'application.job',
          'application.job.company',
          'interview',
          'interview.application',
          'interview.application.job',
          'interview.application.job.company',
        ],
      });
      if (!existing) {
        if (!type) {
          throw new NotFoundException('Activity not found');
        }
      } else {
        if (existing.user.id !== userId) {
          throw new ForbiddenException('Not authorized');
        }
        if (message !== undefined) {
          existing.message = message;
        }
        existing.date = new Date();
        const saved = await this.activityRepository.save(existing);
        return sanitizeActivity(saved);
      }
    }

    // Path 2: by (applicationId | interviewId)
    if (!applicationId && !interviewId) {
      throw new BadRequestException('Provide activityId or applicationId or interviewId');
    }
    if (!type) {
      throw new BadRequestException('type is required when using applicationId/interviewId');
    }

    // Replaced the untyped 'where: any' with a QueryBuilder to keep strict typing
    const qb = this.activityRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.user', 'user')
      .leftJoinAndSelect('activity.application', 'application')
      .leftJoinAndSelect('application.job', 'job')
      .leftJoinAndSelect('job.company', 'company')
      .leftJoinAndSelect('activity.interview', 'interview')
      .leftJoinAndSelect('interview.application', 'i_application')
      .leftJoinAndSelect('i_application.job', 'i_job')
      .leftJoinAndSelect('i_job.company', 'i_company')
      .where('user.id = :userId', { userId })
      .andWhere('activity.type = :type', { type });

    if (applicationId) {
      qb.andWhere('application.id = :applicationId', { applicationId });
    }
    if (interviewId) {
      qb.andWhere('interview.id = :interviewId', { interviewId });
    }

    let existingByRef = await qb.getOne();

    if (existingByRef) {
      if (message !== undefined) {
        existingByRef.message = message;
        existingByRef.date = new Date();
        existingByRef = await this.activityRepository.save(existingByRef);
      }
      return sanitizeActivity(existingByRef);
    }

    // Create new
    return this.createActivity(userId, type, {
      applicationId,
      interviewId,
      message,
    });
  }

  async createActivity(
    userId: string,
    type: 'application' | 'interview' | 'other',
    opts?: { applicationId?: string; interviewId?: string; message?: string }
  ): Promise<IActivity> {
    const activity = this.activityRepository.create({
      user: { id: userId } as User,
      type,
      message: opts?.message,
      application: opts?.applicationId ? ({ id: opts.applicationId } as Application) : undefined,
      interview: opts?.interviewId ? ({ id: opts.interviewId } as Interview) : undefined,
    });
    const saved = await this.activityRepository.save(activity);

    // Reload with relations for consistent sanitize (cheap for single row)
    const reloaded = await this.activityRepository.findOne({
      where: { activityId: saved.activityId },
      relations: [
        'application',
        'application.job',
        'application.job.company',
        'interview',
        'interview.application',
        'interview.application.job',
        'interview.application.job.company',
      ],
    });
    return sanitizeActivity(reloaded || saved);
  }
}
