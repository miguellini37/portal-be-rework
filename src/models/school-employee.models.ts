import { IsString, IsOptional, IsEmail } from 'class-validator';

export class ICreateSchoolEmployeeInput {
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
  schoolName?: string;

  @IsOptional()
  @IsString()
  position?: string;
}

export class IUpdateSchoolEmployeeInput {
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
  schoolRefId?: string;
}

export class ISchoolEmployeeQueryInput {
  @IsOptional()
  @IsString()
  schoolId?: string;

  @IsOptional()
  @IsString()
  wildcardTerm?: string;
}
