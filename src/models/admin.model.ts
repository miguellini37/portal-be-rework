import { Company, School, User } from '../entities';

export type IGetAllUsersResponse = (Pick<
  User,
  'id' | 'email' | 'firstName' | 'lastName' | 'permission' | 'isVerified'
> & {
  company?: { id: string; companyName: string };
  school?: { id: string; schoolName: string };
})[];

export type IGetAllCompaniesResponse = (Pick<Company, 'id' | 'companyName'> & {
  ownerName: string;
  ownerEmail: string;
})[];

export type IGetAllSchoolsResponse = (Pick<School, 'id' | 'schoolName'> & {
  ownerName: string;
  ownerEmail: string;
})[];

export interface ICreateCompanyInput {
  companyName: string;
  ownerId?: string;
}

export interface ICreateSchoolInput {
  schoolName: string;
  ownerId?: string;
}

export interface IGetAllUsersInput {
  name?: string;
  permission?: string;
  schoolId?: string;
  companyId?: string;
}

export interface IUpdateSchoolOwnerInput {
  schoolId: string;
  ownerId: string;
}

export interface IUpdateCompanyOwnerInput {
  companyId: string;
  ownerId: string;
}
