import { IsString, IsOptional, IsUUID } from 'class-validator';
import { USER_PERMISSIONS } from '../constants/user-permissions';

export class ICreateProfileInput {
  @IsString()
  permission!: USER_PERMISSIONS;

  @IsOptional()
  @IsUUID()
  schoolId?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;
}
