import { IsString, IsOptional, IsUUID } from 'class-validator';

export class IUpdateSchoolInput {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  schoolName?: string;
}

export class ISchoolQueryInput {
  @IsOptional()
  @IsString()
  wildcardTerm?: string;
}