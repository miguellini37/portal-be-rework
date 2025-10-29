import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { SchoolEmployee } from '../entities/SchoolEmployee';
import { School } from '../entities/School';
import {
  IUpdateSchoolEmployeeInput,
  ISchoolEmployeeQueryInput,
} from '../models/school-employee.models';

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

      if (updateDto.schoolId) {
        const school = await this.schoolRepository.findOneBy({ id: updateDto.schoolId });
        if (school) {
          employee.school = school;
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
      .leftJoinAndSelect('schoolEmployee.school', 'school');

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
