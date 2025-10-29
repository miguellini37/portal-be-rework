import { IsUUID } from 'class-validator';
import { ApplicationStatus } from '../entities';

export interface IApplicationInput {
  id: string;
  status?: ApplicationStatus;
  jobId?: string;
}

export class ICreateApplicationInput {
  @IsUUID()
  jobId!: string;
}
