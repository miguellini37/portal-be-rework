import { IsString, IsOptional, IsObject } from 'class-validator';
import { ICulture, IBenefits, IRecruiting } from './request.models';

export class IUpdateCompanyInput {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsObject()
  culture?: ICulture;

  @IsOptional()
  @IsObject()
  benefits?: IBenefits;

  @IsOptional()
  @IsObject()
  recruiting?: IRecruiting;
}

export class ICompanyQueryInput {
  @IsOptional()
  @IsString()
  wildcardTerm?: string;

  @IsOptional()
  @IsString()
  industry?: string;
}
