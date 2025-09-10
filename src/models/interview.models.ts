import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { InterviewStatus } from '../entities/Interview';
import { IDateRange } from './dateRange';

export class ICreateInterviewInput {
  @IsUUID()
  applicationId!: string;

  @IsDateString()
  dateTime!: string; // ISO string

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  interviewer?: string;

  @IsOptional()
  @IsString()
  preparationTips?: string;
}

export class IUpdateInterviewInput {
  @IsUUID()
  id!: string;

  @IsEnum(InterviewStatus)
  status!: InterviewStatus;

  @IsDateString()
  dateTime!: string; // ISO string

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  preparationTips?: string;

  @IsOptional()
  @IsString()
  interviewer?: string;
}

export class IGetInterviewsInput {
  @IsOptional()
  @IsUUID()
  jobId?: string;

  @IsOptional()
  dateRange?: IDateRange;
}

export class IGetInterviewInput {
  @IsOptional()
  @IsUUID()
  applicationId?: string;

  @IsOptional()
  @IsUUID()
  interviewId?: string;
}
