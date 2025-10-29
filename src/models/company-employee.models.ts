import { IsString, IsOptional, IsEmail } from 'class-validator';

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
  position?: string;

  @IsOptional()
  @IsString()
  companyId?: string;
}

export class ICompanyEmployeeQueryInput {
  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  wildcardTerm?: string;
}
