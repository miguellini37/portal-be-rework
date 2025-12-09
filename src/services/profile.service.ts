import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository, ObjectLiteral } from 'typeorm';
import { User } from '../entities/User';
import { SchoolEmployee } from '../entities/SchoolEmployee';
import { CompanyEmployee } from '../entities/CompanyEmployee';
import {
  IAllOrgUsersResponse,
  ICreateProfileInput,
  IWhiteListUserInput,
  IGetAllOrgUsersInput,
} from '../models/profile.models';
import { IAuthenticatedRequest } from '../models/request.models';
import { KeycloakService } from './keycloak.service';
import { USER_PERMISSIONS } from '../constants/user-permissions';
import { Athlete, EmailWhitelist } from '../entities';
import { isNil } from 'lodash';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private keycloakService: KeycloakService,
    @InjectRepository(CompanyEmployee)
    private companyEmployeeRepository: Repository<CompanyEmployee>,
    @InjectRepository(SchoolEmployee)
    private schoolEmployeeRepository: Repository<SchoolEmployee>,
    @InjectRepository(Athlete)
    private athleteRepository: Repository<Athlete>,
    @InjectRepository(EmailWhitelist)
    private emailWhitelistRepository: Repository<EmailWhitelist>
  ) {}

  async getProfile(sub: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id: sub } });
  }

  async getAllOrgUsers(
    req: IAuthenticatedRequest,
    filters: IGetAllOrgUsersInput
  ): Promise<IAllOrgUsersResponse> {
    let students: User[] = [];
    let employees: User[] = [];

    if (req.user.schoolId) {
      // Fetch students
      students = await this.buildFilteredQuery(
        this.athleteRepository,
        'athlete',
        'schoolId',
        req.user.schoolId,
        filters
      ).getMany();

      // Fetch school employees
      employees = await this.buildFilteredQuery(
        this.schoolEmployeeRepository,
        'employee',
        'schoolId',
        req.user.schoolId,
        filters
      ).getMany();
    }

    if (req.user.companyId) {
      // Fetch company employees
      employees = await this.buildFilteredQuery(
        this.companyEmployeeRepository,
        'employee',
        'companyId',
        req.user.companyId,
        filters
      ).getMany();
    }

    return {
      employees,
      students,
    };
  }

  /**
   * Create user profile after Keycloak registration
   */
  async createProfile(req: IAuthenticatedRequest, input: ICreateProfileInput): Promise<void> {
    const existingByKeycloakId = await this.userRepository.findOne({
      where: { id: req.user.sub },
    });
    if (existingByKeycloakId) {
      throw new BadRequestException('User with this email already exists in the database.');
    }

    const user: DeepPartial<Athlete | SchoolEmployee | CompanyEmployee> = {
      id: req.user.sub,
      email: req.user.email,
      firstName: req.user.given_name,
      lastName: req.user.family_name,
      permission: input.permission,
      school: input.schoolId ? { id: input.schoolId } : undefined,
      company: input.companyId ? { id: input.companyId } : undefined,
    };

    // If user is in whitelist, set isVerified
    const whitelistEntry = await this.checkWhitelist(
      req.user.email,
      input.schoolId ?? input.companyId ?? ''
    );
    if (whitelistEntry) {
      user.isVerified = whitelistEntry.isActive;
    }

    // Create the specific entity type based on permission
    switch (input.permission) {
      case USER_PERMISSIONS.ATHLETE:
        await this.athleteRepository.save(this.athleteRepository.create(user));
        break;
      case USER_PERMISSIONS.SCHOOL:
        await this.schoolEmployeeRepository.save(this.schoolEmployeeRepository.create(user));
        break;
      case USER_PERMISSIONS.COMPANY:
        await this.companyEmployeeRepository.save(this.companyEmployeeRepository.create(user));
        break;
      default:
        await this.userRepository.save(this.userRepository.create(user));
    }

    // Update Keycloak user attributes
    await this.keycloakService.updateUserAttributes(req.user.sub, {
      permission: input.permission,
      schoolId: input.schoolId,
      companyId: input.companyId,
      isOrgVerified: user.isVerified ? user.isVerified?.toString() : undefined,
    });
  }

  /**
   * Add email to whitelist and update user info
   */
  async whiteListUser(input: IWhiteListUserInput): Promise<boolean> {
    await this.addToWhitelist(input.email, input.orgId, input.isActive);

    const existingUser = await this.userRepository.findOne({
      where: { email: input.email },
    });

    // If user exists and matches org, update isVerified status in db and Keycloak
    if (
      existingUser &&
      ((existingUser as Athlete | SchoolEmployee).schoolId === input.orgId ||
        (existingUser as CompanyEmployee).companyId === input.orgId)
    ) {
      existingUser.isVerified = input.isActive;
      await this.userRepository.save(existingUser);

      await this.keycloakService.updateUserAttributes(existingUser.id, {
        isOrgVerified: input.isActive.toString(),
      });
      this.logger.log(`Updated isVerified for user ${existingUser.email} to ${input.isActive}`);
    }

    return true;
  }

  /**
   * Check if an email matches any whitelist entry for the given org
   */
  async checkWhitelist(email: string, orgId: string): Promise<EmailWhitelist | null> {
    return await this.emailWhitelistRepository.findOne({
      where: { orgId, email },
    });
  }

  /**
   * Add email to whitelist
   */
  async addToWhitelist(email: string, orgId: string, isActive = true): Promise<EmailWhitelist> {
    // Check for duplicate entries
    const existingEntry = await this.emailWhitelistRepository.findOne({
      where: { email, orgId },
    });

    if (existingEntry) {
      return existingEntry;
    }

    const whitelistEntry = this.emailWhitelistRepository.create({
      email,
      orgId,
      isActive,
    });

    return await this.emailWhitelistRepository.save(whitelistEntry);
  }

  /**
   * Helper function to build query with filters
   */
  private buildFilteredQuery<T extends ObjectLiteral>(
    repository: Repository<T>,
    alias: string,
    orgIdColumn: string,
    orgId: string,
    filters?: IGetAllOrgUsersInput
  ) {
    const query = repository
      .createQueryBuilder(alias)
      .select([
        `${alias}.id`,
        `${alias}.firstName`,
        `${alias}.lastName`,
        `${alias}.email`,
        `${alias}.isVerified`,
      ])
      .where(`${alias}.${orgIdColumn} = :orgId`, { orgId });

    if (filters?.name) {
      query.andWhere(
        `(LOWER(${alias}.firstName) LIKE LOWER(:name) OR LOWER(${alias}.lastName) LIKE LOWER(:name) OR LOWER(CONCAT(${alias}.firstName, " ", ${alias}.lastName)) LIKE LOWER(:name))`,
        { name: `%${filters.name}%` }
      );
    }

    if (filters?.email) {
      query.andWhere(`LOWER(${alias}.email) LIKE LOWER(:email)`, {
        email: `%${filters.email}%`,
      });
    }

    if (!isNil(filters?.isVerified)) {
      query.andWhere(`${alias}.isVerified = :isVerified`, {
        isVerified: filters.isVerified,
      });
    }
    if (filters?.isVerified === null) {
      query.andWhere(`${alias}.isVerified IS NULL`);
    }

    return query;
  }
}
