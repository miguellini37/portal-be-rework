import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolEvent } from '../../entities/SchoolEvent';
import { School } from '../../entities/School';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ICreateSchoolEventInput, IUpdateSchoolEventInput, ISchoolEventQueryInput } from '../../models/school-event.models';

@Controller('school-events')
@UseGuards(JwtAuthGuard)
export class SchoolEventsController {
  constructor(
    @InjectRepository(SchoolEvent)
    private schoolEventRepository: Repository<SchoolEvent>,
    @InjectRepository(School)
    private schoolRepository: Repository<School>,
  ) {}

  @Post('/')
  async createSchoolEvent(@Request() req: any, @Body() createDto: ICreateSchoolEventInput) {
    try {
      const schoolId = req.user?.schoolRefId;
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
    } catch (error) {
      throw new Error('Failed to create school event');
    }
  }

  @Put('/:id')
  async updateSchoolEvent(@Param('id') id: string, @Body() updateDto: IUpdateSchoolEventInput) {
    try {
      const event = await this.schoolEventRepository.findOneBy({ id });
      if (!event) {
        throw new Error('School event not found');
      }

      Object.assign(event, updateDto);
      await this.schoolEventRepository.save(event);
      return { message: 'School event updated successfully' };
    } catch (error) {
      throw new Error('Failed to update school event');
    }
  }

  @Delete('/:id')
  async deleteSchoolEvent(@Param('id') id: string) {
    try {
      const result = await this.schoolEventRepository.delete(id);
      if (result.affected === 0) {
        throw new Error('School event not found');
      }
      return { message: 'School event deleted successfully' };
    } catch (error) {
      throw new Error('Failed to delete school event');
    }
  }

  @Get('/')
  async getSchoolEvents(@Request() req: any, @Query() query: ISchoolEventQueryInput) {
    const queryBuilder = this.schoolEventRepository
      .createQueryBuilder('schoolEvent')
      .leftJoinAndSelect('schoolEvent.school', 'school');

    if (query.schoolId) {
      queryBuilder.where('school.id = :schoolId', { schoolId: query.schoolId });
    } else if (req.user?.schoolRefId) {
      queryBuilder.where('school.id = :schoolId', { schoolId: req.user.schoolRefId });
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