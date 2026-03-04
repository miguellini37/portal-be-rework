import { IsOptional, IsUUID } from 'class-validator';
import { User } from '../entities';

export class ICreateProfileInput {
  @IsOptional()
  @IsUUID()
  schoolId?: string;
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
