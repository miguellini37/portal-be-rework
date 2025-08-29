import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class ILoginInput {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

export class IRefreshTokenInput {
  @IsString()
  refreshToken!: string;
}

export class IRegisterInput {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsString()
  permission!: 'athlete' | 'company' | 'school';

  @IsOptional()
  @IsString()
  schoolName?: string;

  @IsOptional()
  @IsString()
  companyName?: string;
}

export class IAuthResponse {
  accessToken!: string;
  refreshToken!: string;
  expiresIn!: number;
  refreshTokenExpireIn!: number;
  tokenType!: string;
  authState!: IUserTokenPayload;
}

export type IUserTokenPayload = {
  id: string;
  email: string;
  permission: string;
  firstName: string;
  lastName: string;
  companyRefId?: string;
  schoolRefId?: string;
};
