import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { SchoolEmployee } from '../entities/SchoolEmployee';
import {
  IUpdateSchoolEmployeeInput,
  ISchoolEmployeeQueryInput,
} from '../models/school-employee.models';
import { KeycloakService } from './keycloak.service';

@Injectable()
export class SchoolEmployeeService {
  constructor(
    @InjectRepository(SchoolEmployee)
    private schoolEmployeeRepository: Repository<SchoolEmployee>,
    private keycloakService: KeycloakService
  ) {}

  async updateSchoolEmployee(userId: string, updateInput: IUpdateSchoolEmployeeInput) {
    try {
      const employee = await this.schoolEmployeeRepository.findOneBy({ id: userId });
      if (!employee) {
        throw new Error('School employee not found');
      }

      const schoolHasChanged = employee.schoolId !== updateInput.schoolId;

      Object.assign(employee, {
        ...updateInput,
        school: updateInput.schoolId ? { id: updateInput.schoolId } : undefined,
        isVerified: schoolHasChanged ? null : employee.isVerified,
      });

      await this.schoolEmployeeRepository.save(employee);

      if (schoolHasChanged) {
        await this.keycloakService.updateUserAttributes(userId, {
          schoolId: updateInput.schoolId,
          isOrgVerified: undefined,
        });
      }
      return { message: 'School employee updated successfully' };
    } catch {
      throw new Error('Failed to update school employee');
    }
  }

  async getSchoolEmployees(userId: string, query: ISchoolEmployeeQueryInput) {
    const queryBuilder = this.schoolEmployeeRepository
      .createQueryBuilder('schoolEmployee')
      .leftJoinAndSelect('schoolEmployee.school', 'school')
      .where('schoolEmployee.isVerified = :isVerified', { isVerified: true });

    if (query.schoolId) {
      queryBuilder.andWhere('school.id = :schoolId', { schoolId: query.schoolId });
    } else if (userId) {
      // Use user ID to filter by associated school
      queryBuilder.andWhere('school.id = :schoolId', { schoolId: userId });
    }

    if (query.wildcardTerm) {
      this.addWildcardFilterToQuery(
        queryBuilder,
        ['schoolEmployee.firstName', 'schoolEmployee.lastName', 'schoolEmployee.email'],
        query.wildcardTerm
      );
    }

    if (query.position) {
      queryBuilder.andWhere('schoolEmployee.position = :position', { position: query.position });
    }

    const employees = await queryBuilder.getMany();
    return employees;
  }

  async getSchoolEmployee(id: string) {
    try {
      const employee = await this.schoolEmployeeRepository.findOne({
        where: { id },
        relations: ['school'],
      });

      if (!employee) {
        throw new Error('School employee not found');
      }

      return employee;
    } catch {
      throw new Error('School employee not found');
    }
  }

  private addWildcardFilterToQuery(
    query: SelectQueryBuilder<SchoolEmployee>,
    fields: string[],
    term: string
  ) {
    const conditions = fields.map((field, index) => {
      const paramName = `term${index}`;
      query.setParameter(paramName, `%${term}%`);
      return `${field} LIKE :${paramName}`;
    });

    query.andWhere(`(${conditions.join(' OR ')})`);
  }
}
