import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository, ObjectLiteral } from 'typeorm';
import { User } from '../entities/User';
import { SchoolEmployee } from '../entities/SchoolEmployee';
import { CompanyEmployee } from '../entities/CompanyEmployee';
import { SchoolDomain } from '../entities/SchoolDomain';
import {
  IAllOrgUsersResponse,
  ICreateProfileInput,
  IWhiteListUserInput,
  IGetAllOrgUsersInput,
} from '../models/profile.models';
import { IAuthenticatedRequest } from '../models/request.models';
import { KeycloakService } from './keycloak.service';
import { EmailService } from './email.service';
import { USER_PERMISSIONS } from '../constants/user-permissions';
import { Athlete, Company, EmailWhitelist, School } from '../entities';
import { isNil } from 'lodash';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private keycloakService: KeycloakService,
    private emailService: EmailService,
    @InjectRepository(CompanyEmployee)
    private companyEmployeeRepository: Repository<CompanyEmployee>,
    @InjectRepository(SchoolEmployee)
    private schoolEmployeeRepository: Repository<SchoolEmployee>,
    @InjectRepository(Athlete)
    private athleteRepository: Repository<Athlete>,
    @InjectRepository(EmailWhitelist)
    private emailWhitelistRepository: Repository<EmailWhitelist>,
    @InjectRepository(SchoolDomain)
    private schoolDomainRepository: Repository<SchoolDomain>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(School)
    private schoolRepository: Repository<School>
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
   * Create user profile after Keycloak registration.
   * Routes to the appropriate handler based on permission type.
   */
  async createProfile(req: IAuthenticatedRequest, input: ICreateProfileInput): Promise<void> {
    const existingByKeycloakId = await this.userRepository.findOne({
      where: { id: req.user.sub },
    });
    if (existingByKeycloakId) {
      throw new BadRequestException('User with this email already exists in the database.');
    }

    const permission = req.user.permission;
    switch (permission) {
      case USER_PERMISSIONS.ATHLETE:
        return this.createAthleteProfile(req, input);
      case USER_PERMISSIONS.SCHOOL:
        return this.createSchoolEmployeeProfile(req);
      case USER_PERMISSIONS.COMPANY:
        return this.createCompanyEmployeeProfile(req);
      default:
        throw new BadRequestException(`Invalid permission type: ${permission}`);
    }
  }

  /**
   * Create an athlete profile.
   * If schoolId is provided, uses it directly. Otherwise, auto-links by email domain.
   * If neither produces a school match, the profile is not created.
   */
  private async createAthleteProfile(
    req: IAuthenticatedRequest,
    input: ICreateProfileInput
  ): Promise<void> {
    let resolvedSchoolId: string | undefined = input.schoolId;

    if (!resolvedSchoolId) {
      const emailDomain = this.extractEmailDomain(req.user.email);
      const schoolDomain = await this.schoolDomainRepository.findOne({
        where: { domain: emailDomain },
        relations: ['school'],
      });

      if (schoolDomain?.school) {
        resolvedSchoolId = schoolDomain.school.id;
        this.logger.log(
          `Auto-linked athlete ${req.user.email} to school "${schoolDomain.school.schoolName}" via domain "${emailDomain}"`
        );
      } else {
        throw new BadRequestException(
          'Your email domain does not match any known school. Please select your school manually or contact help@portaljobs.net.'
        );
      }
    }

    const user: DeepPartial<Athlete> = {
      id: req.user.sub,
      email: req.user.email,
      firstName: req.user.given_name,
      lastName: req.user.family_name,
      permission: USER_PERMISSIONS.ATHLETE,
      school: { id: resolvedSchoolId },
      isVerified: !!resolvedSchoolId, // Only auto-verified if we could link to a school
    };

    const whitelistEntry = await this.checkWhitelist(req.user.email, resolvedSchoolId);
    if (whitelistEntry) {
      user.isVerified = whitelistEntry.isActive;
    }

    await this.athleteRepository.save(this.athleteRepository.create(user));

    await this.keycloakService.updateUserAttributes(req.user.sub, {
      schoolId: resolvedSchoolId,
      isVerified: user.isVerified !== undefined ? user.isVerified.toString() : 'false',
    });
  }

  /**
   * Create a school employee profile.
   * Auto-links to a school by matching the user's email domain against known school domains.
   * If no match is found, the account is created unverified and support is notified.
   */
  private async createSchoolEmployeeProfile(req: IAuthenticatedRequest): Promise<void> {
    const user: DeepPartial<SchoolEmployee> = {
      id: req.user.sub,
      email: req.user.email,
      firstName: req.user.given_name,
      lastName: req.user.family_name,
      permission: USER_PERMISSIONS.SCHOOL,
    };

    const emailDomain = this.extractEmailDomain(req.user.email);

    const schoolDomain = await this.schoolDomainRepository.findOne({
      where: { domain: emailDomain },
      relations: ['school'],
    });

    if (!schoolDomain?.school) {
      this.logger.warn(
        `No school found for domain "${emailDomain}" — user ${req.user.email} needs manual review`
      );
      await this.sendManualReviewEmail(req.user.email, emailDomain);
      throw new BadRequestException(
        'Your email domain does not match any known school. Your account has been created but requires manual review. Please contact help@portaljobs.net.'
      );
    }

    const resolvedSchoolId = schoolDomain.school.id;
    user.school = { id: resolvedSchoolId };
    this.logger.log(
      `Auto-linked school employee ${req.user.email} to school "${schoolDomain.school.schoolName}" via domain "${emailDomain}"`
    );

    const savedEmployee = await this.schoolEmployeeRepository.save(
      this.schoolEmployeeRepository.create(user)
    );

    // If this school has no owner yet, make the first employee the owner
    const school = schoolDomain.school;
    const wasOwnerSet = !school.ownerId;
    if (wasOwnerSet) {
      school.schoolOwner = savedEmployee;
      await this.schoolRepository.save(school);
      this.logger.log(`Set ${req.user.email} as owner of school "${school.schoolName}"`);
    }

    try {
      await this.keycloakService.updateUserAttributes(req.user.sub, {
        schoolId: resolvedSchoolId,
        isVerified: 'true',
      });
    } catch (error) {
      // Roll back the DB changes so the user can retry registration
      if (wasOwnerSet) {
        school.schoolOwner = undefined;
        await this.schoolRepository.save(school);
      }
      await this.schoolEmployeeRepository.remove(savedEmployee);
      this.logger.error(
        `Failed to update Keycloak attributes for ${req.user.email} — rolled back DB insert`,
        error instanceof Error ? error.stack : error
      );
      throw new BadRequestException(
        'Account setup failed due to an authentication service error. Please try again.'
      );
    }
  }

  /**
   * Create a company employee profile.
   * Auto-links to a company by matching the user's email domain against company orgDomain.
   * If no company exists with that domain, the employee is created without a company
   * (isVerified = false) so the FE can redirect them to create the company profile.
   */
  private async createCompanyEmployeeProfile(req: IAuthenticatedRequest): Promise<void> {
    const user: DeepPartial<CompanyEmployee> = {
      id: req.user.sub,
      email: req.user.email,
      firstName: req.user.given_name,
      lastName: req.user.family_name,
      permission: USER_PERMISSIONS.COMPANY,
    };

    let resolvedCompanyId: string | undefined;
    const emailDomain = this.extractEmailDomain(req.user.email);

    // Look up company by orgDomain
    const company = await this.companyRepository.findOne({
      where: { orgDomain: emailDomain },
    });

    if (company) {
      // Company exists — auto-link and verify
      resolvedCompanyId = company.id;
      user.company = { id: resolvedCompanyId };
      user.isVerified = true;
      this.logger.log(
        `Auto-linked company employee ${req.user.email} to company "${company.companyName}" via domain "${emailDomain}"`
      );
    } else {
      // No company with this domain yet — create one and link the employee as owner
      const guessedName = this.guessCompanyName(emailDomain);
      const newCompany = this.companyRepository.create({
        companyName: guessedName,
        orgDomain: emailDomain,
      });
      const savedCompany = await this.companyRepository.save(newCompany);
      resolvedCompanyId = savedCompany.id;
      user.company = { id: resolvedCompanyId };
      user.isVerified = true;
      this.logger.log(
        `Created new company "${guessedName}" for domain "${emailDomain}" — owner: ${req.user.email}`
      );
    }

    const savedEmployee = await this.companyEmployeeRepository.save(
      this.companyEmployeeRepository.create(user)
    );

    // If the company has no owner yet, make the first employee the owner
    const targetCompany =
      company ?? (await this.companyRepository.findOne({ where: { id: resolvedCompanyId } }));
    const wasOwnerSet = targetCompany && !targetCompany.ownerId;
    if (targetCompany && wasOwnerSet) {
      targetCompany.companyOwner = savedEmployee;
      await this.companyRepository.save(targetCompany);
      this.logger.log(`Set ${req.user.email} as owner of company "${targetCompany.companyName}"`);
    }

    try {
      await this.keycloakService.updateUserAttributes(req.user.sub, {
        companyId: resolvedCompanyId,
        isVerified: user.isVerified !== undefined ? user.isVerified.toString() : 'false',
      });
    } catch (error) {
      // Roll back the DB changes so the user can retry registration
      if (wasOwnerSet && targetCompany) {
        targetCompany.companyOwner = undefined;
        await this.companyRepository.save(targetCompany);
      }
      await this.companyEmployeeRepository.remove(savedEmployee);
      this.logger.error(
        `Failed to update Keycloak attributes for ${req.user.email} — rolled back DB insert`,
        error instanceof Error ? error.stack : error
      );
      throw new BadRequestException(
        'Account setup failed due to an authentication service error. Please try again.'
      );
    }
  }

  /**
   * Guess a company name from a domain.
   * e.g. "acme-corp.com" → "Acme Corp"
   */
  private guessCompanyName(domain: string): string {
    const name = domain.split('.')[0];
    return name
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Extract the domain portion from an email address.
   * e.g. "john@stanford.edu" → "stanford.edu"
   */
  private extractEmailDomain(email: string): string {
    const parts = email.split('@');
    const domain = parts[1].toLowerCase().trim();

    if (!domain) {
      throw new Error(`Invalid email address: ${email}`);
    }
    return domain;
  }

  /**
   * Send an email to support requesting manual review of a school employee
   * whose email domain doesn't match any known school.
   */
  private async sendManualReviewEmail(userEmail: string, domain: string): Promise<void> {
    await this.emailService.sendEmail({
      to: 'help@portaljobs.net',
      subject: 'Manual Review Required — School Employee Registration',
      body: [
        `A new user registered as a school employee but their email domain does not match any known school.`,
        ``,
        `User email: ${userEmail}`,
        `Domain: ${domain}`,
        ``,
        `Please review this account and manually assign them to a school, or contact the user for more information.`,
      ].join('\n'),
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
        isVerified: input.isActive.toString(),
      });
      this.logger.log(`Updated isVerified for user ${existingUser.email} to ${input.isActive}`);

      if (input.isActive && existingUser.email) {
        await this.emailService.sendEmail({
          to: existingUser.email,
          subject: 'Your Portal Jobs account has been verified',
          body: `Hi ${existingUser.firstName ?? 'there'},\n\nYour Portal Jobs account has been verified. You now have full access to the platform.\n\nLog in at https://portaljobs.net to get started.\n\nThanks,\nThe Portal Jobs Team`,
        });
      }

      return true;
    }

    throw new Error('User not found or does not belong to the specified organization');
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
