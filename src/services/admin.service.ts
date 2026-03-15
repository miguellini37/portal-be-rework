import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Company } from '../entities/Company';
import {
  ICreateCompanyInput,
  ICreateSchoolInput,
  IGetAllCompaniesResponse,
  IGetAllSchoolsResponse,
  IGetAllUsersInput,
  IGetAllUsersResponse,
  IUpdateSchoolOwnerInput,
  IUpdateCompanyOwnerInput,
} from '../models/admin.model';
import { School, User, SchoolEmployee, CompanyEmployee } from '../entities';
import { ProfileService } from './profile.service';
import { EmailService } from './email.service';
import { USER_PERMISSIONS } from '../constants/user-permissions';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(School)
    private schoolRepository: Repository<School>,
    private profileService: ProfileService,
    private emailService: EmailService,
    private dataSource: DataSource
  ) {}

  async getAllUsers(input?: IGetAllUsersInput): Promise<IGetAllUsersResponse> {
    try {
      const queryBuilder = this.userRepository
        .createQueryBuilder('user')
        .select([
          'user.id',
          'user.email',
          'user.firstName',
          'user.lastName',
          'user.permission',
          'user.companyId',
          'user.schoolId',
          'user.isVerified',
          'company.companyName',
          'school.schoolName',
          'company.id',
          'school.id',
        ])
        .leftJoin('user.company', 'company')
        .leftJoin('user.school', 'school');

      if (input?.name) {
        queryBuilder.andWhere("CONCAT(user.firstName, ' ', user.lastName) LIKE :name", {
          name: `%${input.name}%`,
        });
      }

      if (input?.permission) {
        queryBuilder.andWhere('user.permission = :permission', {
          permission: input.permission,
        });
      }

      if (input?.schoolId) {
        queryBuilder.andWhere('user.schoolId = :schoolId', {
          schoolId: input.schoolId,
        });
      }

      if (input?.companyId) {
        queryBuilder.andWhere('user.companyId = :companyId', {
          companyId: input.companyId,
        });
      }

      return (await queryBuilder.getMany()) as IGetAllUsersResponse;
    } catch {
      throw new Error('Failed to get all users');
    }
  }

  async setUserVerified(userId: string, isVerified: boolean): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    user.isVerified = isVerified;
    return await this.userRepository.save(user);
  }

  sendVerificationEmail(user: User): void {
    if (user.email) {
      this.emailService.sendEmail({
        to: user.email,
        subject: 'Your Portal Jobs account has been verified',
        body: `Hi ${user.firstName ?? 'there'},\n\nYour Portal Jobs account has been verified. You now have full access to the platform.\n\nLog in at https://portaljobs.net to get started.\n\nThanks,\nThe Portal Jobs Team`,
      });
    }
  }

  async getAllCompanies(): Promise<IGetAllCompaniesResponse> {
    try {
      const companies = await this.companyRepository
        .createQueryBuilder('company')
        .select(['company.id', 'company.companyName'])
        .leftJoin('company.companyOwner', 'companyOwner')
        .addSelect(['companyOwner.firstName', 'companyOwner.lastName', 'companyOwner.email'])
        .getMany();

      return companies.map((company) => ({
        id: company.id,
        companyName: company.companyName ?? '',
        ownerName: company.companyOwner
          ? `${company.companyOwner.firstName ?? ''} ${company.companyOwner.lastName ?? ''}`
          : '',
        ownerEmail: company.companyOwner?.email ?? '',
      }));
    } catch {
      throw new Error('Failed to get all companies');
    }
  }

  async getAllSchools(): Promise<IGetAllSchoolsResponse> {
    try {
      const schools = await this.schoolRepository
        .createQueryBuilder('school')
        .select(['school.id', 'school.schoolName'])
        .leftJoin('school.schoolOwner', 'schoolOwner')
        .addSelect(['schoolOwner.firstName', 'schoolOwner.lastName', 'schoolOwner.email'])
        .getMany();

      return schools.map((school) => ({
        id: school.id,
        schoolName: school.schoolName ?? '',
        ownerName: school.schoolOwner
          ? `${school.schoolOwner.firstName ?? ''} ${school.schoolOwner.lastName ?? ''}`
          : '',
        ownerEmail: school.schoolOwner?.email ?? '',
      }));
    } catch {
      throw new Error('Failed to get all schools');
    }
  }

  async createCompany(input: ICreateCompanyInput): Promise<Company> {
    try {
      const company = this.companyRepository.create({
        companyName: input.companyName,
        ownerId: input.ownerId,
      });

      return await this.companyRepository.save(company);
    } catch {
      throw new Error('Failed to create company');
    }
  }

  async createSchool(input: ICreateSchoolInput): Promise<School> {
    try {
      const school = this.schoolRepository.create({
        schoolName: input.schoolName,
        ownerId: input.ownerId,
      });

      return await this.schoolRepository.save(school);
    } catch {
      throw new Error('Failed to create school');
    }
  }

  async updateSchoolOwner(input: IUpdateSchoolOwnerInput): Promise<School> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const school = await queryRunner.manager.findOne(School, {
        where: { id: input.schoolId },
      });
      if (!school) {
        throw new Error('School not found');
      }

      const owner = await queryRunner.manager.findOne(User, {
        where: { id: input.ownerId },
      });
      if (!owner) {
        throw new Error('User not found');
      }
      if (owner.permission !== USER_PERMISSIONS.SCHOOL) {
        throw new Error('User must be a school employee to be set as school owner');
      }

      // Link user to school and verify
      await queryRunner.manager
        .createQueryBuilder()
        .update(SchoolEmployee)
        .set({ school: { id: input.schoolId }, isVerified: true })
        .where('id = :id', { id: input.ownerId })
        .execute();

      // Set as owner
      await queryRunner.manager
        .createQueryBuilder()
        .update(School)
        .set({ schoolOwner: { id: input.ownerId } })
        .where('id = :id', { id: input.schoolId })
        .execute();

      await queryRunner.commitTransaction();

      const updated = await this.schoolRepository.findOne({ where: { id: input.schoolId } });
      if (!updated) {
        throw new Error('School not found after update');
      }
      return updated;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(
        `Failed to update school owner: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      await queryRunner.release();
    }
  }

  async updateCompanyOwner(input: IUpdateCompanyOwnerInput): Promise<Company> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const company = await queryRunner.manager.findOne(Company, {
        where: { id: input.companyId },
      });
      if (!company) {
        throw new Error('Company not found');
      }

      const owner = await queryRunner.manager.findOne(User, {
        where: { id: input.ownerId },
      });
      if (!owner) {
        throw new Error('User not found');
      }
      if (owner.permission !== USER_PERMISSIONS.COMPANY) {
        throw new Error('User must be a company employee to be set as company owner');
      }

      // Link user to company and verify
      await queryRunner.manager
        .createQueryBuilder()
        .update(CompanyEmployee)
        .set({ company: { id: input.companyId }, isVerified: true })
        .where('id = :id', { id: input.ownerId })
        .execute();

      // Set as owner
      await queryRunner.manager
        .createQueryBuilder()
        .update(Company)
        .set({ companyOwner: { id: input.ownerId } })
        .where('id = :id', { id: input.companyId })
        .execute();

      await queryRunner.commitTransaction();

      const updated = await this.companyRepository.findOne({ where: { id: input.companyId } });
      if (!updated) {
        throw new Error('Company not found after update');
      }
      return updated;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(
        `Failed to update company owner: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      await queryRunner.release();
    }
  }
}
