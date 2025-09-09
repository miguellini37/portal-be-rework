import { ApplicationStatus } from '../entities';

export interface IApplicationInput {
  id: string;
  status?: ApplicationStatus;
  jobId?: string;
}
