import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity, ActivityType } from '../entities/Activity';
import { IActivity } from '../models/activity.model';

// very simple for now, can be expanded
const sanitizeActivity = (activity: Activity): IActivity => {
  const { activityId, type, date } = activity;
  let message = activity.message ?? '';
  if (activity.type === ActivityType.APPLICATION && activity.application) {
    const { job, status } = activity.application;
    if (job) {
      message =
        message ||
        `Application for ${job.position} at ${job?.company?.companyName} was updated to ${status}`;
    }
  } else if (activity.type === ActivityType.INTERVIEW && activity.interview) {
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

  async getActivities(userId: string, limit?: number): Promise<IActivity[]> {
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
      ...(limit && { take: limit }),
    });
    return activities.map(sanitizeActivity);
  }

  async createActivity(
    userId: string,
    type: ActivityType,
    opts?: { applicationId?: string; interviewId?: string; message?: string }
  ): Promise<IActivity> {
    const activity = this.activityRepository.create({
      user: { id: userId },
      type,
      message: opts?.message,
      date: new Date(),
      application: opts?.applicationId ? { id: opts.applicationId } : undefined,
      interview: opts?.interviewId ? { id: opts.interviewId } : undefined,
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
