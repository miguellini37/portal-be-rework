import { IsString, IsOptional, IsObject } from 'class-validator';
import { IAcademics, IAthletics } from './request.models';

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
  @IsObject()
  academics?: IAcademics;

  @IsOptional()
  @IsObject()
  athletics?: IAthletics;

  @IsOptional()
  @IsString({ each: true })
  skills?: string[];
}

export class IAthleteQueryInput {
  @IsOptional()
  @IsString()
  wildcardTerm?: string;
}
