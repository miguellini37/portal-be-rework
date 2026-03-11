import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyEmployee } from '../entities';
import { IUpdateCompanyEmployeeInput } from '../models/company-employee.models';
import { KeycloakService } from './keycloak.service';

@Injectable()
export class CompanyEmployeeService {
  constructor(
    @InjectRepository(CompanyEmployee)
    private companyEmployeeRepository: Repository<CompanyEmployee>,
    private keycloakService: KeycloakService
  ) {}

  async updateCompanyEmployee(
    userId: string,
    userEmail: string,
    updateInput: IUpdateCompanyEmployeeInput
  ) {
    try {
      const companyEmployee = await this.companyEmployeeRepository.findOneBy({ email: userEmail });
      if (!companyEmployee) {
        throw new HttpException('Company employee not found', HttpStatus.NOT_FOUND);
      }

      const companyHasChanged = companyEmployee.companyId !== updateInput.companyId;

      Object.assign(companyEmployee, {
        firstName: updateInput.firstName ?? companyEmployee.firstName,
        lastName: updateInput.lastName ?? companyEmployee.lastName,
        phone: updateInput.phone ?? companyEmployee.phone,
        bio: updateInput.bio ?? companyEmployee.bio,
        linkedIn: updateInput.linkedIn ?? companyEmployee.linkedIn,
        position: updateInput.position ?? companyEmployee.position,
        roleType: updateInput.roleType ?? companyEmployee.roleType,
        company: updateInput.companyId ? { id: updateInput.companyId } : undefined,
        isVerified: companyHasChanged ? null : companyEmployee.isVerified,
        isFormerAthlete: updateInput.isFormerAthlete ?? companyEmployee.isFormerAthlete,
        athleteSport: updateInput.athleteSport ?? companyEmployee.athleteSport,
        athletePosition: updateInput.athletePosition ?? companyEmployee.athletePosition,
        athleteUniversity: updateInput.athleteUniversity ?? companyEmployee.athleteUniversity,
        athleteGraduationYear:
          updateInput.athleteGraduationYear ?? companyEmployee.athleteGraduationYear,
        athleteAchievements: updateInput.athleteAchievements ?? companyEmployee.athleteAchievements,
      });

      await this.companyEmployeeRepository.save(companyEmployee);

      if (companyHasChanged) {
        await this.keycloakService.updateUserAttributes(userId, {
          companyId: updateInput.companyId,
          isVerified: undefined,
        });
      }
      return { message: 'Company employee updated successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update company employee',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getCompanyEmployee(id: string) {
    try {
      if (!id) {
        throw new HttpException('Invalid company employee ID', HttpStatus.BAD_REQUEST);
      }

      const companyEmployee = await this.companyEmployeeRepository.findOne({
        where: { id },
        relations: ['company'],
      });

      if (!companyEmployee) {
        throw new HttpException('Company employee not found', HttpStatus.NOT_FOUND);
      }

      // Remove sensitive information
      const { permission: _permission, ...safeEmployee } = companyEmployee;
      return safeEmployee;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to fetch company employee', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
