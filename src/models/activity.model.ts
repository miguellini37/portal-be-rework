import { ActivityType, Application } from '../entities';
import { Interview } from '../entities';
export interface IActivity {
  activityId: string;
  type: ActivityType;
  message: string;
  date: Date;
  application?: Application;
  interview?: Interview;
}

export interface IRecentActivityInput {
  limit?: number;
}
