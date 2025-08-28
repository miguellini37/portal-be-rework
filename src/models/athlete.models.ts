import { IsString, IsOptional, IsUUID } from 'class-validator';

export class ICreateApplicationInput {
  @IsUUID()
  jobId!: string;
}

export class IUpdateAthleteInput {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  schoolId?: string;

  @IsOptional()
  academics?: any;

  @IsOptional()
  athletics?: any;
}

export class IAthleteQueryInput {
  @IsOptional()
  @IsString()
  wildcardTerm?: string;
}