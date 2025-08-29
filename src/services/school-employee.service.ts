import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolEmployee } from '../entities/SchoolEmployee';
import { School } from '../entities/School';
import {
  IUpdateSchoolEmployeeInput,
  ISchoolEmployeeQueryInput,
} from '../models/school-employee.models';
import { sanitizeUser } from '../auth/utils';

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
    } catch (error) {
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
      queryBuilder.andWhere(
        'schoolEmployee.firstName LIKE :term OR schoolEmployee.lastName LIKE :term OR schoolEmployee.email LIKE :term',
        { term: `%${query.wildcardTerm}%` }
      );
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
    } catch (error) {
      throw new Error('School employee not found');
    }
  }
}
