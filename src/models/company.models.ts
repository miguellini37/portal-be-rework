import { IsString, IsOptional, IsObject } from 'class-validator';

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
  culture?: any;

  @IsOptional()
  @IsObject()
  benefits?: any;

  @IsOptional()
  @IsObject()
  recruiting?: any;
}

export class ICompanyQueryInput {
  @IsOptional()
  @IsString()
  wildcardTerm?: string;

  @IsOptional()
  @IsString()
  industry?: string;
}