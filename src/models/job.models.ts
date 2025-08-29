import { IsString, IsOptional, IsDateString, IsArray } from 'class-validator';

export class ICreateJobInput {
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

export class IUpdateJobInput {
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

export class IJobQueryInput {
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
