import { IsString, IsOptional, IsUUID } from 'class-validator';
import { USER_PERMISSIONS } from '../constants/user-permissions';
import { User } from '../entities';

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

export interface IWhiteListUserInput {
  email: string;
  orgId: string;
  isActive: boolean;
}

export interface IGetAllOrgUsersInput {
  name?: string;
  email?: string;
  isVerified?: boolean;
}

type OrgUserResponse = Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'isVerified'>;
export interface IAllOrgUsersResponse {
  students: OrgUserResponse[];
  employees: OrgUserResponse[];
}
