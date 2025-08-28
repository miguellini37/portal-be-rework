import { IsString, IsOptional, IsDateString, IsArray } from 'class-validator';

export class CreateJobDto {
  @IsString()
  position!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsDateString()
  applicationDeadline?: string;

  @IsOptional()
  @IsString()
  benefits?: string;
}

export class UpdateJobDto {
  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsDateString()
  applicationDeadline?: string;

  @IsOptional()
  @IsString()
  benefits?: string;
}

export class JobQueryDto {
  @IsOptional()
  @IsString()
  wildcardTerm?: string;

  @IsOptional()
  @IsArray()
  companies?: string[];

  @IsOptional()
  @IsArray()
  industries?: string[];

  @IsOptional()
  @IsArray()
  experiences?: string[];

  @IsOptional()
  @IsArray()
  durations?: string[];
}