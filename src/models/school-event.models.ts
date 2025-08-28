import { IsString, IsOptional, IsDateString } from 'class-validator';

export class ICreateSchoolEventInput {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  eventDate!: string;

  @IsOptional()
  @IsString()
  location?: string;
}

export class IUpdateSchoolEventInput {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  eventDate?: string;

  @IsOptional()
  @IsString()
  location?: string;
}

export class ISchoolEventQueryInput {
  @IsOptional()
  @IsString()
  schoolId?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}