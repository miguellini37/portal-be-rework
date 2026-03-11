import { IsString, IsOptional, IsEmail, IsBoolean } from 'class-validator';

export class ICreateCompanyEmployeeInput {
  @IsEmail()
  email!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsString()
  password!: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  position?: string;
}

export class IUpdateCompanyEmployeeInput {
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
  bio?: string;

  @IsOptional()
  @IsString()
  linkedIn?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  roleType?: string;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsBoolean()
  isFormerAthlete?: boolean;

  @IsOptional()
  @IsString()
  athleteSport?: string;

  @IsOptional()
  @IsString()
  athletePosition?: string;

  @IsOptional()
  @IsString()
  athleteUniversity?: string;

  @IsOptional()
  @IsString()
  athleteGraduationYear?: string;

  @IsOptional()
  @IsString()
  athleteAchievements?: string;
}

export class ICompanyEmployeeQueryInput {
  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  wildcardTerm?: string;
}
