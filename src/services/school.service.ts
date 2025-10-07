import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from '../entities/School';
import { Athlete } from '../entities/Athlete';
import { Application, ApplicationStatus } from '../entities/Application';
import { Company } from '../entities/Company';
import { Activity } from '../entities/Activity';
import { Job, JobType } from '../entities/Job';
import {
  IUpdateSchoolInput,
  ISchoolQueryInput,
  IUniversityOverviewResponse,
  IUniversityNILOversightResponse,
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
    private activityRepository: Repository<Activity>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>
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

  async getUniversityNILOversight(schoolId: string): Promise<IUniversityNILOversightResponse> {
    try {
      // Verify school exists
      const school = await this.schoolRepository.findOneBy({ id: schoolId });
      if (!school) {
        throw new Error('School not found');
      }

      // Calculate academic year ranges (August to July)
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Current academic year: if we're in Jan-July, academic year started last Aug; if Aug-Dec, started this Aug
      const currentAcademicYearStart =
        currentMonth >= 7
          ? new Date(currentYear, 7, 1) // August 1st of current year
          : new Date(currentYear - 1, 7, 1); // August 1st of previous year

      const currentAcademicYearEnd = new Date(currentAcademicYearStart);
      currentAcademicYearEnd.setFullYear(currentAcademicYearEnd.getFullYear() + 1);
      currentAcademicYearEnd.setMonth(6, 31); // July 31st
      currentAcademicYearEnd.setHours(23, 59, 59, 999);

      // Previous academic year
      const previousAcademicYearStart = new Date(currentAcademicYearStart);
      previousAcademicYearStart.setFullYear(previousAcademicYearStart.getFullYear() - 1);

      const previousAcademicYearEnd = new Date(previousAcademicYearStart);
      previousAcademicYearEnd.setFullYear(previousAcademicYearEnd.getFullYear() + 1);
      previousAcademicYearEnd.setMonth(6, 31);
      previousAcademicYearEnd.setHours(23, 59, 59, 999);

      // 1. Total Accepted NIL Deals (current academic year)
      const totalAcceptedDealsCurrentYear = await this.applicationRepository
        .createQueryBuilder('application')
        .leftJoin('application.job', 'job')
        .leftJoin('application.athlete', 'athlete')
        .leftJoin('athlete.schoolRef', 'school')
        .where('school.id = :schoolId', { schoolId })
        .andWhere('application.status = :status', { status: ApplicationStatus.accepted })
        .andWhere('job.type = :jobType', { jobType: JobType.NIL })
        .andWhere('application.terminalStatusDate >= :start', { start: currentAcademicYearStart })
        .andWhere('application.terminalStatusDate <= :end', { end: currentAcademicYearEnd })
        .getCount();

      // 2. Total Accepted NIL Deals (previous academic year)
      const totalAcceptedDealsLastYear = await this.applicationRepository
        .createQueryBuilder('application')
        .leftJoin('application.job', 'job')
        .leftJoin('application.athlete', 'athlete')
        .leftJoin('athlete.schoolRef', 'school')
        .where('school.id = :schoolId', { schoolId })
        .andWhere('application.status = :status', { status: ApplicationStatus.accepted })
        .andWhere('job.type = :jobType', { jobType: JobType.NIL })
        .andWhere('application.terminalStatusDate >= :start', { start: previousAcademicYearStart })
        .andWhere('application.terminalStatusDate <= :end', { end: previousAcademicYearEnd })
        .getCount();

      // 3. Total NIL Applications (all time)
      const totalNILApplications = await this.applicationRepository
        .createQueryBuilder('application')
        .leftJoin('application.job', 'job')
        .leftJoin('application.athlete', 'athlete')
        .leftJoin('athlete.schoolRef', 'school')
        .where('school.id = :schoolId', { schoolId })
        .andWhere('job.type = :jobType', { jobType: JobType.NIL })
        .getCount();

      // 4. NIL Applications Under Review
      const applicationsUnderReview = await this.applicationRepository
        .createQueryBuilder('application')
        .leftJoin('application.job', 'job')
        .leftJoin('application.athlete', 'athlete')
        .leftJoin('athlete.schoolRef', 'school')
        .where('school.id = :schoolId', { schoolId })
        .andWhere('application.status = :status', { status: ApplicationStatus.under_review })
        .andWhere('job.type = :jobType', { jobType: JobType.NIL })
        .getCount();

      // 5. Total Value of Accepted NIL Deals (current academic year)
      const totalValueResult = await this.applicationRepository
        .createQueryBuilder('application')
        .leftJoin('application.job', 'job')
        .leftJoin('application.athlete', 'athlete')
        .leftJoin('athlete.schoolRef', 'school')
        .select('SUM(job.salary)', 'totalValue')
        .where('school.id = :schoolId', { schoolId })
        .andWhere('application.status = :status', { status: ApplicationStatus.accepted })
        .andWhere('job.type = :jobType', { jobType: JobType.NIL })
        .andWhere('application.terminalStatusDate >= :start', { start: currentAcademicYearStart })
        .andWhere('application.terminalStatusDate <= :end', { end: currentAcademicYearEnd })
        .getRawOne();

      const totalValue = totalValueResult?.totalValue || 0;

      // Calculate approval rate
      const approvalRate =
        totalNILApplications > 0 ? (totalAcceptedDealsCurrentYear / totalNILApplications) * 100 : 0;

      // 6. Get 5 Most Recent NIL Deals (most recently updated NIL applications)
      const recentDealsData = await this.applicationRepository
        .createQueryBuilder('application')
        .leftJoinAndSelect('application.job', 'job')
        .leftJoinAndSelect('job.company', 'company')
        .leftJoin('application.athlete', 'athlete')
        .leftJoin('athlete.schoolRef', 'school')
        .select([
          'application.id',
          'application.status',
          'application.creationDate',
          'job.id',
          'job.position',
          'job.description',
          'job.industry',
          'job.experience',
          'job.createdDate',
          'job.applicationDeadline',
          'job.benefits',
          'job.type',
          'job.requirements',
          'job.location',
          'job.salary',
          'job.paymentType',
          'job.duration',
          'job.athleteBenefits',
          'job.status',
          'company.id',
          'company.companyName',
          'company.industry',
          'athlete.firstName',
          'athlete.lastName',
        ])
        .where('school.id = :schoolId', { schoolId })
        .andWhere('job.type = :jobType', { jobType: JobType.NIL })
        .orderBy('application.creationDate', 'DESC')
        .limit(5)
        .getMany();

      const recentDeals = recentDealsData.map((application) => ({
        id: application.job.id,
        position: application.job.position,
        description: application.job.description,
        industry: application.job.industry,
        experience: application.job.experience,
        createdDate: application.job.createdDate,
        applicationDeadline: application.job.applicationDeadline,
        benefits: application.job.benefits,
        type: application.job.type,
        requirements: application.job.requirements,
        location: application.job.location,
        salary: application.job.salary,
        paymentType: application.job.paymentType,
        duration: application.job.duration,
        athleteBenefits: application.job.athleteBenefits,
        status: application.job.status,
        company: application.job.company
          ? {
              id: application.job.company.id,
              companyName: application.job.company.companyName,
              industry: application.job.company.industry,
            }
          : undefined,
        applicationStatus: application.status,
        applicationCreationDate: application.creationDate,
        athleteName: application.athlete
          ? `${application.athlete.firstName} ${application.athlete.lastName}`
          : undefined,
      }));

      return {
        metrics: {
          totalAcceptedDeals: {
            currentYear: totalAcceptedDealsCurrentYear,
            lastYear: totalAcceptedDealsLastYear,
          },
          totalApplications: totalNILApplications,
          approvalRate: Math.round(approvalRate * 100) / 100, // Round to 2 decimal places
          applicationsUnderReview,
          totalValue,
        },
        recentDeals,
      };
    } catch (error) {
      throw new Error(
        `Failed to get NIL oversight: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
