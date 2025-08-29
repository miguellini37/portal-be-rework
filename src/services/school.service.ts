import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from '../entities/School';
import { IUpdateSchoolInput, ISchoolQueryInput } from '../models/school.models';

@Injectable()
export class SchoolService {
  constructor(
    @InjectRepository(School)
    private schoolRepository: Repository<School>
  ) {}

  async updateSchool(updateSchoolDto: IUpdateSchoolInput) {
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

  async getSchool(id: string) {
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

  async getSchools(query: ISchoolQueryInput) {
    const queryBuilder = this.schoolRepository.createQueryBuilder('school');

    if (query.wildcardTerm) {
      queryBuilder.where('school.schoolName LIKE :term', { term: `%${query.wildcardTerm}%` });
    }

    return await queryBuilder.getMany();
  }
}
