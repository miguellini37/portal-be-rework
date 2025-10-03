import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Athlete } from '../entities/Athlete';
import { Application, ApplicationStatus } from '../entities/Application';
import { Job, JobType } from '../entities/Job';
import {
  ICareerOutcomesQueryInput,
  IStudentJobOutcomesResponse,
  IPlacementBySportItem,
  ISalaryDistributionResponse,
  IStudentOutcome,
} from '../models/career-outcomes.models';

@Injectable()
export class CareerOutcomesService {
  constructor(
    @InjectRepository(Athlete)
    private athleteRepository: Repository<Athlete>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>
  ) {}

  async getStudentJobOutcomes(schoolId: string): Promise<IStudentJobOutcomesResponse> {
    const now = new Date();
    const currentYear = now.getFullYear();
    const nextYear = currentYear + 1;

    // Define date ranges for "graduating in the next year"
    const nextYearStart = new Date(currentYear, 0, 1);
    const nextYearEnd = new Date(nextYear, 11, 31);

    // Define date ranges for "graduating in the past year" (for last year data)
    const lastYearStart = new Date(currentYear - 1, 0, 1);
    const lastYearEnd = new Date(currentYear, 11, 31);

    // For "past year" comparison (extra year in the past)
    const twoYearsAgoStart = new Date(currentYear - 2, 0, 1);
    const twoYearsAgoEnd = new Date(currentYear - 1, 11, 31);

    // Current Year Metrics
    const currentPlacementRate = await this.calculatePlacementRate(
      schoolId,
      nextYearStart,
      nextYearEnd
    );
    const currentAverageSalary = await this.calculateAverageSalary(
      schoolId,
      nextYearStart,
      nextYearEnd
    );
    const currentTimeToPlacement = await this.calculateTimeToPlacement(
      schoolId,
      lastYearStart,
      lastYearEnd
    );
    const currentActiveJobSeekers = await this.calculateActiveJobSeekers(
      schoolId,
      nextYearStart,
      nextYearEnd
    );

    // Last Year Metrics
    const lastYearPlacementRate = await this.calculatePlacementRate(
      schoolId,
      lastYearStart,
      lastYearEnd
    );
    const lastYearAverageSalary = await this.calculateAverageSalary(
      schoolId,
      lastYearStart,
      lastYearEnd
    );
    const lastYearTimeToPlacement = await this.calculateTimeToPlacement(
      schoolId,
      twoYearsAgoStart,
      twoYearsAgoEnd
    );
    const lastYearActiveJobSeekers = await this.calculateActiveJobSeekers(
      schoolId,
      lastYearStart,
      lastYearEnd
    );

    return {
      placementRate: {
        current: currentPlacementRate,
        lastYear: lastYearPlacementRate,
      },
      averageSalary: {
        current: currentAverageSalary,
        lastYear: lastYearAverageSalary,
      },
      timeToPlacement: {
        current: currentTimeToPlacement,
        lastYear: lastYearTimeToPlacement,
      },
      activeJobSeekers: {
        current: currentActiveJobSeekers,
        lastYear: lastYearActiveJobSeekers,
      },
    };
  }

  async getPlacementBySport(
    schoolId: string,
    filters: ICareerOutcomesQueryInput
  ): Promise<IPlacementBySportItem[]> {
    const year = filters.year ?? new Date().getFullYear();
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);

    const queryBuilder = this.athleteRepository
      .createQueryBuilder('athlete')
      .leftJoin('athlete.schoolRef', 'school')
      .leftJoinAndSelect(
        'application',
        'app',
        'app.athleteId = athlete.id AND app.status = :status',
        { status: ApplicationStatus.accepted }
      )
      .leftJoinAndSelect('app.job', 'job', 'job.type = :jobType', { jobType: JobType.JOB })
      .where('school.id = :schoolId', { schoolId })
      .andWhere('athlete.academicsGraduationdate >= :yearStart', { yearStart })
      .andWhere('athlete.academicsGraduationdate <= :yearEnd', { yearEnd });

    if (filters.sport) {
      queryBuilder.andWhere('athlete.athleticsSport = :sport', { sport: filters.sport });
    }

    if (filters.industry) {
      queryBuilder.andWhere('job.industry = :industry', { industry: filters.industry });
    }

    const athletes = await queryBuilder
      .select(['athlete.id', 'athlete.athleticsSport', 'app.id', 'job.id'])
      .getRawMany();

    // Group by sport
    const sportMap = new Map<string, { withJob: Set<string>; total: Set<string> }>();

    for (const row of athletes) {
      const sport = row.athlete_athleticsSport || 'Unknown';
      const athleteId = row.athlete_id;
      const hasJob = !!row.app_id;

      if (!sportMap.has(sport)) {
        sportMap.set(sport, { withJob: new Set(), total: new Set() });
      }

      const sportData = sportMap.get(sport)!;
      sportData.total.add(athleteId);
      if (hasJob) {
        sportData.withJob.add(athleteId);
      }
    }

    const result: IPlacementBySportItem[] = [];
    for (const [sport, data] of sportMap.entries()) {
      result.push({
        sport,
        athletesWithJobs: data.withJob.size,
        totalAthletes: data.total.size,
      });
    }

    return result;
  }

  async getSalaryDistribution(
    schoolId: string,
    filters: ICareerOutcomesQueryInput
  ): Promise<ISalaryDistributionResponse> {
    const year = filters.year ?? new Date().getFullYear();
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);

    const queryBuilder = this.applicationRepository
      .createQueryBuilder('application')
      .leftJoin('application.job', 'job')
      .leftJoin('application.athlete', 'athlete')
      .leftJoin('athlete.schoolRef', 'school')
      .where('school.id = :schoolId', { schoolId })
      .andWhere('application.status = :status', { status: ApplicationStatus.accepted })
      .andWhere('job.type = :jobType', { jobType: JobType.JOB })
      .andWhere('athlete.academicsGraduationdate >= :yearStart', { yearStart })
      .andWhere('athlete.academicsGraduationdate <= :yearEnd', { yearEnd })
      .andWhere('job.salary IS NOT NULL');

    if (filters.sport) {
      queryBuilder.andWhere('athlete.athleticsSport = :sport', { sport: filters.sport });
    }

    if (filters.industry) {
      queryBuilder.andWhere('job.industry = :industry', { industry: filters.industry });
    }

    const applications = await queryBuilder.select(['job.salary']).getRawMany();

    const distribution = {
      over100k: 0,
      range80kTo99k: 0,
      range60kTo79k: 0,
      range40kTo59k: 0,
      under40k: 0,
    };

    for (const app of applications) {
      const salary = app.job_salary;
      if (salary >= 100000) {
        distribution.over100k++;
      } else if (salary >= 80000) {
        distribution.range80kTo99k++;
      } else if (salary >= 60000) {
        distribution.range60kTo79k++;
      } else if (salary >= 40000) {
        distribution.range40kTo59k++;
      } else {
        distribution.under40k++;
      }
    }

    return distribution;
  }

  async getStudentOutcomes(
    schoolId: string,
    filters: ICareerOutcomesQueryInput
  ): Promise<IStudentOutcome[]> {
    const year = filters.year ?? new Date().getFullYear();
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);

    const queryBuilder = this.athleteRepository
      .createQueryBuilder('athlete')
      .leftJoin('athlete.schoolRef', 'school')
      .leftJoinAndSelect(
        'jobApp',
        'jobApplication',
        'jobApplication.athleteId = athlete.id AND jobApplication.status = :acceptedStatus',
        { acceptedStatus: ApplicationStatus.accepted }
      )
      .leftJoinAndSelect('jobApplication.job', 'job', 'job.type = :jobType', {
        jobType: JobType.JOB,
      })
      .where('school.id = :schoolId', { schoolId })
      .andWhere('athlete.academicsGraduationdate >= :yearStart', { yearStart })
      .andWhere('athlete.academicsGraduationdate <= :yearEnd', { yearEnd });

    if (filters.sport) {
      queryBuilder.andWhere('athlete.athleticsSport = :sport', { sport: filters.sport });
    }

    if (filters.industry) {
      queryBuilder.andWhere('job.industry = :industry', { industry: filters.industry });
    }

    if (filters.hasJob !== undefined) {
      if (filters.hasJob) {
        queryBuilder.andWhere('jobApplication.id IS NOT NULL');
      } else {
        queryBuilder.andWhere('jobApplication.id IS NULL');
      }
    }

    const athletes = await queryBuilder.getMany();

    // For each athlete, count internships and NIL
    const results: IStudentOutcome[] = [];
    for (const athlete of athletes) {
      // Count internships and NIL
      const internshipCount = await this.applicationRepository
        .createQueryBuilder('application')
        .leftJoin('application.job', 'job')
        .where('application.athleteId = :athleteId', { athleteId: athlete.id })
        .andWhere('application.status = :status', { status: ApplicationStatus.accepted })
        .andWhere('job.type = :type', { type: JobType.INTERNSHIP })
        .getCount();

      const nilCount = await this.applicationRepository
        .createQueryBuilder('application')
        .leftJoin('application.job', 'job')
        .where('application.athleteId = :athleteId', { athleteId: athlete.id })
        .andWhere('application.status = :status', { status: ApplicationStatus.accepted })
        .andWhere('job.type = :type', { type: JobType.NIL })
        .getCount();

      // Check if athlete has a job
      const hasJob = await this.applicationRepository
        .createQueryBuilder('application')
        .leftJoin('application.job', 'job')
        .where('application.athleteId = :athleteId', { athleteId: athlete.id })
        .andWhere('application.status = :status', { status: ApplicationStatus.accepted })
        .andWhere('job.type = :type', { type: JobType.JOB })
        .getCount();

      // Get the industry from the accepted job
      const jobWithIndustry = await this.applicationRepository
        .createQueryBuilder('application')
        .leftJoin('application.job', 'job')
        .where('application.athleteId = :athleteId', { athleteId: athlete.id })
        .andWhere('application.status = :status', { status: ApplicationStatus.accepted })
        .andWhere('job.type = :type', { type: JobType.JOB })
        .select(['job.industry'])
        .getRawOne();

      results.push({
        id: athlete.id,
        name: `${athlete.firstName} ${athlete.lastName}`,
        sport: athlete.athletics?.sport,
        hasJob: hasJob > 0,
        major: athlete.academics?.major,
        gpa: athlete.academics?.gpa,
        industry: jobWithIndustry?.job_industry,
        graduationDate: athlete.academics?.graduationDate,
        internshipCount,
        nilCount,
        location: athlete.location,
      });
    }

    return results;
  }

  // Helper methods
  private async calculatePlacementRate(
    schoolId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    // Total athletes graduating in the period
    const totalGraduating = await this.athleteRepository
      .createQueryBuilder('athlete')
      .leftJoin('athlete.schoolRef', 'school')
      .where('school.id = :schoolId', { schoolId })
      .andWhere('athlete.academicsGraduationdate >= :startDate', { startDate })
      .andWhere('athlete.academicsGraduationdate <= :endDate', { endDate })
      .getCount();

    if (totalGraduating === 0) {
      return 0;
    }

    // Athletes with accepted jobs
    const withJobs = await this.applicationRepository
      .createQueryBuilder('application')
      .leftJoin('application.job', 'job')
      .leftJoin('application.athlete', 'athlete')
      .leftJoin('athlete.schoolRef', 'school')
      .where('school.id = :schoolId', { schoolId })
      .andWhere('application.status = :status', { status: ApplicationStatus.accepted })
      .andWhere('job.type = :jobType', { jobType: JobType.JOB })
      .andWhere('athlete.academicsGraduationdate >= :startDate', { startDate })
      .andWhere('athlete.academicsGraduationdate <= :endDate', { endDate })
      .select('COUNT(DISTINCT athlete.id)', 'count')
      .getRawOne();

    const placementCount = parseInt(withJobs?.count || '0', 10);
    return Math.round((placementCount / totalGraduating) * 100);
  }

  private async calculateAverageSalary(
    schoolId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const result = await this.applicationRepository
      .createQueryBuilder('application')
      .leftJoin('application.job', 'job')
      .leftJoin('application.athlete', 'athlete')
      .leftJoin('athlete.schoolRef', 'school')
      .where('school.id = :schoolId', { schoolId })
      .andWhere('application.status = :status', { status: ApplicationStatus.accepted })
      .andWhere('job.type = :jobType', { jobType: JobType.JOB })
      .andWhere('athlete.academicsGraduationdate >= :startDate', { startDate })
      .andWhere('athlete.academicsGraduationdate <= :endDate', { endDate })
      .andWhere('job.salary IS NOT NULL')
      .select('AVG(job.salary)', 'avgSalary')
      .getRawOne();

    return Math.round(parseFloat(result?.avgSalary || '0'));
  }

  private async calculateTimeToPlacement(
    schoolId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const applications = await this.applicationRepository
      .createQueryBuilder('application')
      .leftJoin('application.job', 'job')
      .leftJoin('application.athlete', 'athlete')
      .leftJoin('athlete.schoolRef', 'school')
      .where('school.id = :schoolId', { schoolId })
      .andWhere('application.status = :status', { status: ApplicationStatus.accepted })
      .andWhere('job.type = :jobType', { jobType: JobType.JOB })
      .andWhere('athlete.academicsGraduationdate >= :startDate', { startDate })
      .andWhere('athlete.academicsGraduationdate <= :endDate', { endDate })
      .andWhere('application.terminalStatusDate IS NOT NULL')
      .select(['athlete.academicsGraduationdate', 'application.terminalStatusDate'])
      .getRawMany();

    if (applications.length === 0) {
      return 0;
    }

    let totalMonths = 0;
    for (const app of applications) {
      const gradDate = new Date(app.athlete_academicsGraduationdate);
      const terminalDate = new Date(app.application_terminalStatusDate);

      // If terminal date is before graduation, count as 0 months
      if (terminalDate <= gradDate) {
        totalMonths += 0;
      } else {
        // Calculate months difference
        const monthsDiff =
          (terminalDate.getFullYear() - gradDate.getFullYear()) * 12 +
          (terminalDate.getMonth() - gradDate.getMonth());
        totalMonths += monthsDiff;
      }
    }

    return Math.round(totalMonths / applications.length);
  }

  private async calculateActiveJobSeekers(
    schoolId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    // Athletes graduating in the period without accepted jobs
    const totalGraduating = await this.athleteRepository
      .createQueryBuilder('athlete')
      .leftJoin('athlete.schoolRef', 'school')
      .where('school.id = :schoolId', { schoolId })
      .andWhere('athlete.academicsGraduationdate >= :startDate', { startDate })
      .andWhere('athlete.academicsGraduationdate <= :endDate', { endDate })
      .getMany();

    let activeJobSeekers = 0;
    for (const athlete of totalGraduating) {
      const hasJob = await this.applicationRepository
        .createQueryBuilder('application')
        .leftJoin('application.job', 'job')
        .where('application.athleteId = :athleteId', { athleteId: athlete.id })
        .andWhere('application.status = :status', { status: ApplicationStatus.accepted })
        .andWhere('job.type = :jobType', { jobType: JobType.JOB })
        .getCount();

      if (hasJob === 0) {
        activeJobSeekers++;
      }
    }

    return activeJobSeekers;
  }
}
