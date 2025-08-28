import { Controller, Get, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from '../../entities/School';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IUpdateSchoolInput, ISchoolQueryInput } from '../../models/school.models';

@Controller('schools')
@UseGuards(JwtAuthGuard)
export class SchoolsController {
  constructor(
    @InjectRepository(School)
    private schoolRepository: Repository<School>,
  ) {}

  @Put('/')
  async updateSchool(@Request() req: any, @Body() updateSchoolDto: IUpdateSchoolInput) {
    try {
      const schoolId = updateSchoolDto.id;
      const school = await this.schoolRepository.findOneBy({ id: schoolId });
      
      if (!school) {
        throw new Error('School not found');
      }

      Object.assign(school, {
        schoolName: updateSchoolDto.schoolName ?? school.schoolName,
      });

      await this.schoolRepository.save(school);
      return { message: 'School updated successfully' };
    } catch (error) {
      throw new Error('Failed to update school');
    }
  }

  @Get('/:id')
  async getSchool(@Param('id') id: string) {
    try {
      const school = await this.schoolRepository.findOneBy({ id });
      if (!school) {
        throw new Error('School not found');
      }
      return school;
    } catch (error) {
      throw new Error('School not found');
    }
  }

  @Get('/')
  async getSchools(@Query() query: ISchoolQueryInput) {
    const queryBuilder = this.schoolRepository.createQueryBuilder('school');

    if (query.wildcardTerm) {
      queryBuilder.where('school.schoolName LIKE :term', { term: `%${query.wildcardTerm}%` });
    }

    return await queryBuilder.getMany();
  }
}