import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken!: string;
}

export class RegisterDto {
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

export class AuthResponseDto {
  accessToken!: string;
  refreshToken!: string;
  expiresIn!: number;
  refreshTokenExpireIn!: number;
  tokenType!: string;
  authState!: UserTokenPayload;
}

export type UserTokenPayload = {
  id: string;
  email: string;
  permission: string;
  firstName: string;
  lastName: string;
  companyRefId?: string;
  schoolRefId?: string;
};