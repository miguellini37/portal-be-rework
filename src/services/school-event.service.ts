import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolEvent } from '../entities/SchoolEvent';
import { School } from '../entities/School';
import {
  ICreateSchoolEventInput,
  IUpdateSchoolEventInput,
  ISchoolEventQueryInput,
} from '../models/school-event.models';

@Injectable()
export class SchoolEventService {
  constructor(
    @InjectRepository(SchoolEvent)
    private schoolEventRepository: Repository<SchoolEvent>,
    @InjectRepository(School)
    private schoolRepository: Repository<School>
  ) {}

  async createSchoolEvent(userId: string, createDto: ICreateSchoolEventInput) {
    try {
      const schoolId = userId; // Using the authenticated user's ID to find associated school
      if (!schoolId) {
        throw new Error('School ID is required');
      }

      const school = await this.schoolRepository.findOneBy({ id: schoolId });
      if (!school) {
        throw new Error('School not found');
      }

      const event = this.schoolEventRepository.create({
        ...createDto,
        school,
      });

      await this.schoolEventRepository.save(event);
      return { message: 'School event created successfully', event };
    } catch {
      throw new Error('Failed to create school event');
    }
  }

  async updateSchoolEvent(id: string, updateDto: IUpdateSchoolEventInput) {
    try {
      const event = await this.schoolEventRepository.findOneBy({ id });
      if (!event) {
        throw new Error('School event not found');
      }

      Object.assign(event, updateDto);
      await this.schoolEventRepository.save(event);
      return { message: 'School event updated successfully' };
    } catch {
      throw new Error('Failed to update school event');
    }
  }

  async deleteSchoolEvent(id: string) {
    try {
      const result = await this.schoolEventRepository.delete(id);
      if (result.affected === 0) {
        throw new Error('School event not found');
      }
      return { message: 'School event deleted successfully' };
    } catch {
      throw new Error('Failed to delete school event');
    }
  }

  async getSchoolEvents(userId: string, query: ISchoolEventQueryInput) {
    const queryBuilder = this.schoolEventRepository
      .createQueryBuilder('schoolEvent')
      .leftJoinAndSelect('schoolEvent.school', 'school');

    if (query.schoolId) {
      queryBuilder.where('school.id = :schoolId', { schoolId: query.schoolId });
    } else if (userId) {
      // Use user ID to filter events
      queryBuilder.where('school.id = :schoolId', { schoolId: userId });
    }

    if (query.fromDate) {
      queryBuilder.andWhere('schoolEvent.eventDate >= :fromDate', { fromDate: query.fromDate });
    }

    if (query.toDate) {
      queryBuilder.andWhere('schoolEvent.eventDate <= :toDate', { toDate: query.toDate });
    }

    queryBuilder.orderBy('schoolEvent.eventDate', 'ASC');

    return await queryBuilder.getMany();
  }
}
