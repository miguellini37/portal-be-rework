import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { User } from '../entities/User';
import { SchoolEmployee } from '../entities/SchoolEmployee';
import { CompanyEmployee } from '../entities/CompanyEmployee';
import { ICreateProfileInput } from '../models/profile.models';
import { IAuthenticatedRequest } from '../models/request.models';
import { KeycloakService } from './keycloak.service';
import { USER_PERMISSIONS } from '../constants/user-permissions';
import { Athlete } from '../entities';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private keycloakService: KeycloakService,
    @InjectRepository(CompanyEmployee)
    private companyEmployeeRepository: Repository<CompanyEmployee>,
    @InjectRepository(SchoolEmployee)
    private schoolEmployeeRepository: Repository<SchoolEmployee>,
    @InjectRepository(Athlete)
    private athleteRepository: Repository<Athlete>
  ) {}

  async getProfile(sub: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id: sub } });
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
    });
  }
}
