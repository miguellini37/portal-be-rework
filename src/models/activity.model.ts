import { Application } from '../entities';
import { Interview } from '../entities';
export interface IActivity {
  activityId: string;
  type: 'application' | 'interview' | 'other';
  message: string;
  date: Date;
  application?: Application;
  interview?: Interview;
}

export interface IUpdateActivityInput {
  activityId?: string;
  applicationId?: string;
  interviewId?: string;
  type?: 'application' | 'interview' | 'other';
  message?: string;
}

export interface IRecentActivityInput {
  limit?: number;
}
