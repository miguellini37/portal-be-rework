import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from '../entities/School';
import { Athlete } from '../entities/Athlete';
import { Application, ApplicationStatus } from '../entities/Application';
import { Company } from '../entities/Company';
import { Activity } from '../entities/Activity';
import { JobType } from '../entities/Job';
import {
  IUpdateSchoolInput,
  ISchoolQueryInput,
  IUniversityOverviewResponse,
} from '../models/school.models';

@Injectable()
export class SchoolService {
  constructor(
    @InjectRepository(School)
    private schoolRepository: Repository<School>,
    @InjectRepository(Athlete)
    private athleteRepository: Repository<Athlete>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>
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
    } catch {
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
    } catch {
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

  async getUniversityOverview(schoolId: string): Promise<IUniversityOverviewResponse> {
    try {
      // Verify school exists
      const school = await this.schoolRepository.findOneBy({ id: schoolId });
      if (!school) {
        throw new Error('School not found');
      }

      // Calculate date ranges for current and previous month
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

      // 1. Placed Graduates - Jobs of type 'job' with accepted applications
      const placedGraduatesCurrentMonth = await this.applicationRepository
        .createQueryBuilder('application')
        .leftJoin('application.job', 'job')
        .leftJoin('application.athlete', 'athlete')
        .leftJoin('athlete.schoolRef', 'school')
        .where('school.id = :schoolId', { schoolId })
        .andWhere('application.status = :status', { status: ApplicationStatus.accepted })
        .andWhere('job.type = :jobType', { jobType: JobType.JOB })
        .andWhere('application.terminalStatusDate >= :start', { start: currentMonthStart })
        .getCount();

      const placedGraduatesPreviousMonth = await this.applicationRepository
        .createQueryBuilder('application')
        .leftJoin('application.job', 'job')
        .leftJoin('application.athlete', 'athlete')
        .leftJoin('athlete.schoolRef', 'school')
        .where('school.id = :schoolId', { schoolId })
        .andWhere('application.status = :status', { status: ApplicationStatus.accepted })
        .andWhere('job.type = :jobType', { jobType: JobType.JOB })
        .andWhere('application.terminalStatusDate >= :start', { start: previousMonthStart })
        .andWhere('application.terminalStatusDate <= :end', { end: previousMonthEnd })
        .getCount();

      // 2. Active Sponsors - Number of companies created this month vs previous month
      const activeSponsorsCurrentMonth = await this.companyRepository
        .createQueryBuilder('company')
        .where('company.createdAtDate >= :start', { start: currentMonthStart })
        .getCount();

      const activeSponsorsPreviousMonth = await this.companyRepository
        .createQueryBuilder('company')
        .where('company.createdAtDate >= :start', { start: previousMonthStart })
        .andWhere('company.createdAtDate <= :end', { end: previousMonthEnd })
        .getCount();

      // 3. Community Numbers - Total students associated to the school
      const totalStudents = await this.athleteRepository
        .createQueryBuilder('athlete')
        .leftJoin('athlete.schoolRef', 'school')
        .where('school.id = :schoolId', { schoolId })
        .getCount();

      // 4. Recent Activity - Last 5 activities of all students in school
      const recentActivities = await this.activityRepository
        .createQueryBuilder('activity')
        .leftJoin('activity.user', 'user')
        .leftJoin('user.schoolRef', 'school', 'user.type = :athleteType', {
          athleteType: 'athlete',
        })
        .leftJoin('activity.application', 'application')
        .leftJoin('activity.interview', 'interview')
        .select([
          'activity.activityId',
          'activity.type',
          'activity.message',
          'activity.date',
          'user.firstName',
          'user.lastName',
        ])
        .where('school.id = :schoolId', { schoolId })
        .orderBy('activity.date', 'DESC')
        .limit(5)
        .getRawMany();

      const formattedRecentActivity = recentActivities.map((activity) => ({
        activityId: activity.activity_activityId,
        type: activity.activity_type,
        message: activity.activity_message || '',
        date: activity.activity_date,
        studentName:
          activity.user_firstName && activity.user_lastName
            ? `${activity.user_firstName} ${activity.user_lastName}`
            : undefined,
      }));

      return {
        placedGraduates: {
          currentMonth: placedGraduatesCurrentMonth,
          previousMonth: placedGraduatesPreviousMonth,
        },
        activeSponsors: {
          currentMonth: activeSponsorsCurrentMonth,
          previousMonth: activeSponsorsPreviousMonth,
        },
        communityNumbers: {
          totalStudents,
        },
        recentActivity: formattedRecentActivity,
      };
    } catch (error) {
      throw new Error(
        `Failed to get university overview: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
