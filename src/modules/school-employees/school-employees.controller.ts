import { Controller, Get, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolEmployee } from '../../entities/SchoolEmployee';
import { School } from '../../entities/School';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IUpdateSchoolEmployeeInput, ISchoolEmployeeQueryInput } from '../../models/school-employee.models';
import { sanitizeUser } from '../../auth/utils';

@Controller('school-employees')
@UseGuards(JwtAuthGuard)
export class SchoolEmployeesController {
  constructor(
    @InjectRepository(SchoolEmployee)
    private schoolEmployeeRepository: Repository<SchoolEmployee>,
    @InjectRepository(School)
    private schoolRepository: Repository<School>,
  ) {}

  @Put('/')
  async updateSchoolEmployee(@Request() req: any, @Body() updateDto: IUpdateSchoolEmployeeInput) {
    const userId = req.user?.id;

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

  @Get('/')
  async getSchoolEmployees(@Request() req: any, @Query() query: ISchoolEmployeeQueryInput) {
    const queryBuilder = this.schoolEmployeeRepository
      .createQueryBuilder('schoolEmployee')
      .leftJoinAndSelect('schoolEmployee.schoolRef', 'school');

    if (query.schoolId) {
      queryBuilder.where('school.id = :schoolId', { schoolId: query.schoolId });
    } else if (req.user?.schoolRefId) {
      queryBuilder.where('school.id = :schoolId', { schoolId: req.user.schoolRefId });
    }

    if (query.wildcardTerm) {
      queryBuilder.andWhere(
        'schoolEmployee.firstName LIKE :term OR schoolEmployee.lastName LIKE :term OR schoolEmployee.email LIKE :term',
        { term: `%${query.wildcardTerm}%` }
      );
    }

    const employees = await queryBuilder.getMany();
    return employees.map(employee => sanitizeUser(employee));
  }

  @Get('/:id')
  async getSchoolEmployee(@Param('id') id: string) {
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