import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { SchoolEmployee } from '../entities/SchoolEmployee';
import { School } from '../entities/School';
import { User } from '../entities/User';
import {
  IUpdateSchoolEmployeeInput,
  ISchoolEmployeeQueryInput,
  ICreateSchoolEmployeeInput,
} from '../models/school-employee.models';
import { sanitizeUser } from './auth/utils';
import { USER_PERMISSIONS } from '../constants/user-permissions';

@Injectable()
export class SchoolEmployeeService {
  constructor(
    @InjectRepository(SchoolEmployee)
    private schoolEmployeeRepository: Repository<SchoolEmployee>,
    @InjectRepository(School)
    private schoolRepository: Repository<School>
  ) {}

  async updateSchoolEmployee(userId: string, updateDto: IUpdateSchoolEmployeeInput) {
    try {
      const employee = await this.schoolEmployeeRepository.findOneBy({ id: userId });
      if (!employee) {
        throw new Error('School employee not found');
      }

      Object.assign(employee, updateDto);

      if (updateDto.schoolRefId) {
        const school = await this.schoolRepository.findOneBy({ id: updateDto.schoolRefId });
        if (school) {
          employee.schoolRef = school;
        }
      }

      await this.schoolEmployeeRepository.save(employee);
      return { message: 'School employee updated successfully' };
    } catch {
      throw new Error('Failed to update school employee');
    }
  }

  async getSchoolEmployees(userId: string, query: ISchoolEmployeeQueryInput) {
    const queryBuilder = this.schoolEmployeeRepository
      .createQueryBuilder('schoolEmployee')
      .leftJoinAndSelect('schoolEmployee.schoolRef', 'school');

    if (query.schoolId) {
      queryBuilder.where('school.id = :schoolId', { schoolId: query.schoolId });
    } else if (userId) {
      // Use user ID to filter by associated school
      queryBuilder.where('school.id = :schoolId', { schoolId: userId });
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
    return employees.map((employee) => sanitizeUser(employee));
  }

  async getSchoolEmployee(id: string) {
    try {
      const employee = await this.schoolEmployeeRepository.findOne({
        where: { id },
        relations: ['schoolRef'],
      });

      if (!employee) {
        throw new Error('School employee not found');
      }

      return sanitizeUser(employee);
    } catch {
      throw new Error('School employee not found');
    }
  }

  async createSchoolEmployee(input: ICreateSchoolEmployeeInput): Promise<User> {
    let school = await this.schoolRepository.findOne({
      where: { schoolName: input.schoolName },
    });

    if (!school) {
      school = await this.schoolRepository.save(
        this.schoolRepository.create({ schoolName: input.schoolName })
      );
    }

    const schoolEmployee = this.schoolEmployeeRepository.create({
      ...input,
      schoolRef: school ?? undefined,
      permission: USER_PERMISSIONS.SCHOOL,
    });

    const saved = await this.schoolEmployeeRepository.save(schoolEmployee);

    this.schoolRepository.save({
      ...school,
      ownerRef: schoolEmployee,
    });

    return saved;
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
