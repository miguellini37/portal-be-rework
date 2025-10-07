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

    // Define date ranges for "graduating in the next year" (next 12 months from now)
    const nextYearEnd = new Date(now);
    nextYearEnd.setFullYear(now.getFullYear() + 1);

    // Define date ranges for last year data (12-24 months ago from now)
    const lastYearStart = new Date(now);
    lastYearStart.setFullYear(now.getFullYear() - 1);
    const lastYearEnd = new Date(now);

    // For two years ago (24-36 months ago from now)
    const twoYearsAgoStart = new Date(now);
    twoYearsAgoStart.setFullYear(now.getFullYear() - 2);
    const twoYearsAgoEnd = new Date(now);
    twoYearsAgoEnd.setFullYear(now.getFullYear() - 1);

    // Current Year Metrics (next 12 months)
    const currentPlacementRate = await this.calculatePlacementRate(schoolId, now, nextYearEnd);
    const currentAverageSalary = await this.calculateAverageSalary(schoolId, now, nextYearEnd);
    const currentTimeToPlacement = await this.calculateTimeToPlacement(
      schoolId,
      lastYearStart,
      now
    );
    const currentActiveJobSeekers = await this.calculateActiveJobSeekers(
      schoolId,
      now,
      nextYearEnd
    );

    // Last Year Metrics (12-24 months ago)
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

    // Build dynamic query parts
    const sportFilter = filters.sport ? 'AND athlete.athleticsSport = ?' : '';

    // Use a single query with GROUP BY to compute totals and jobs count in MySQL
    const query = `
      SELECT 
        COALESCE(athlete.athleticsSport, 'Unknown') as sport,
        COUNT(DISTINCT athlete.id) as totalAthletes,
        COUNT(DISTINCT CASE 
          WHEN application.status = ? 
          AND job.type = ?
          ${filters.industry ? 'AND job.industry = ?' : ''}
          THEN athlete.id 
        END) as athletesWithJobs
      FROM athlete
      LEFT JOIN school ON athlete.schoolRefId = school.id
      LEFT JOIN application ON application.athleteId = athlete.id
      LEFT JOIN job ON application.jobId = job.id
      WHERE school.id = ?
        AND athlete.academicsGraduationdate >= ?
        AND athlete.academicsGraduationdate <= ?
        ${sportFilter}
      GROUP BY COALESCE(athlete.athleticsSport, 'Unknown')
      ORDER BY sport
    `;

    const parameters: unknown[] = [ApplicationStatus.accepted, JobType.JOB];

    if (filters.industry) {
      parameters.push(filters.industry);
    }

    parameters.push(schoolId, yearStart, yearEnd);

    if (filters.sport) {
      parameters.push(filters.sport);
    }

    const results = await this.athleteRepository.query(query, parameters);

    return results.map(
      (row: { sport: string; totalAthletes: number; athletesWithJobs: number }) => ({
        sport: row.sport,
        totalAthletes: parseInt(String(row.totalAthletes), 10),
        athletesWithJobs: parseInt(String(row.athletesWithJobs), 10),
      })
    );
  }

  async getSalaryDistribution(
    schoolId: string,
    filters: ICareerOutcomesQueryInput
  ): Promise<ISalaryDistributionResponse> {
    const year = filters.year ?? new Date().getFullYear();
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);

    // Use MySQL CASE statements to count salary ranges in a single query
    const query = `
      SELECT 
        SUM(CASE WHEN job.salary >= 100000 THEN 1 ELSE 0 END) as over100k,
        SUM(CASE WHEN job.salary >= 80000 AND job.salary < 100000 THEN 1 ELSE 0 END) as range80kTo99k,
        SUM(CASE WHEN job.salary >= 60000 AND job.salary < 80000 THEN 1 ELSE 0 END) as range60kTo79k,
        SUM(CASE WHEN job.salary >= 40000 AND job.salary < 60000 THEN 1 ELSE 0 END) as range40kTo59k,
        SUM(CASE WHEN job.salary < 40000 THEN 1 ELSE 0 END) as under40k
      FROM application
      INNER JOIN job ON application.jobId = job.id
      INNER JOIN athlete ON application.athleteId = athlete.id
      INNER JOIN school ON athlete.schoolRefId = school.id
      WHERE school.id = ?
        AND application.status = ?
        AND job.type = ?
        AND athlete.academicsGraduationdate >= ?
        AND athlete.academicsGraduationdate <= ?
        AND job.salary IS NOT NULL
        ${filters.sport ? 'AND athlete.athleticsSport = ?' : ''}
        ${filters.industry ? 'AND job.industry = ?' : ''}
    `;

    const parameters: unknown[] = [
      schoolId,
      ApplicationStatus.accepted,
      JobType.JOB,
      yearStart,
      yearEnd,
    ];

    if (filters.sport) {
      parameters.push(filters.sport);
    }

    if (filters.industry) {
      parameters.push(filters.industry);
    }

    const results = await this.applicationRepository.query(query, parameters);
    const row = results[0] || {
      over100k: 0,
      range80kTo99k: 0,
      range60kTo79k: 0,
      range40kTo59k: 0,
      under40k: 0,
    };

    return {
      over100k: parseInt(String(row.over100k), 10),
      range80kTo99k: parseInt(String(row.range80kTo99k), 10),
      range60kTo79k: parseInt(String(row.range60kTo79k), 10),
      range40kTo59k: parseInt(String(row.range40kTo59k), 10),
      under40k: parseInt(String(row.under40k), 10),
    };
  }

  async getStudentOutcomes(
    schoolId: string,
    filters: ICareerOutcomesQueryInput
  ): Promise<IStudentOutcome[]> {
    const year = filters.year ?? new Date().getFullYear();
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);

    // Build dynamic query parts
    const sportFilter = filters.sport ? 'AND athlete.athleticsSport = ?' : '';
    const havingParts: string[] = [];

    if (filters.hasJob !== undefined) {
      havingParts.push('hasJob = ?');
    }

    if (filters.industry) {
      havingParts.push('industry = ?');
    }

    const havingClause = havingParts.length > 0 ? `HAVING ${havingParts.join(' AND ')}` : '';

    // Use a single query with GROUP BY to get athlete data and counts
    const query = `
      SELECT 
        athlete.id,
        athlete.firstName,
        athlete.lastName,
        athlete.athleticsSport as sport,
        athlete.academicsMajor as major,
        athlete.academicsGpa as gpa,
        athlete.academicsGraduationdate as graduationDate,
        athlete.location,
        COUNT(DISTINCT CASE WHEN job.type = 'job' THEN application.id END) > 0 as hasJob,
        MAX(CASE WHEN job.type = 'job' THEN job.industry END) as industry,
        COUNT(DISTINCT CASE WHEN job.type = 'internship' THEN application.id END) as internshipCount,
        COUNT(DISTINCT CASE WHEN job.type = 'nil' THEN application.id END) as nilCount
      FROM athlete
      INNER JOIN school ON athlete.schoolRefId = school.id
      LEFT JOIN application ON application.athleteId = athlete.id 
        AND application.status = ?
      LEFT JOIN job ON application.jobId = job.id
      WHERE school.id = ?
        AND athlete.academicsGraduationdate >= ?
        AND athlete.academicsGraduationdate <= ?
        ${sportFilter}
      GROUP BY athlete.id, athlete.firstName, athlete.lastName, athlete.athleticsSport, 
               athlete.academicsMajor, athlete.academicsGpa, athlete.academicsGraduationdate, athlete.location
      ${havingClause}
      ORDER BY athlete.lastName, athlete.firstName
    `;

    const parameters: unknown[] = [ApplicationStatus.accepted, schoolId, yearStart, yearEnd];

    if (filters.sport) {
      parameters.push(filters.sport);
    }

    if (filters.hasJob !== undefined) {
      parameters.push(filters.hasJob ? 1 : 0);
    }

    if (filters.industry) {
      parameters.push(filters.industry);
    }

    const results = await this.athleteRepository.query(query, parameters);

    return results.map(
      (row: {
        id: string;
        firstName: string;
        lastName: string;
        sport: string;
        major: string;
        gpa: number;
        graduationDate: Date;
        location: string;
        hasJob: number;
        industry: string;
        internshipCount: number;
        nilCount: number;
      }) => ({
        id: row.id,
        name: `${row.firstName} ${row.lastName}`,
        sport: row.sport,
        hasJob: row.hasJob === 1,
        major: row.major,
        gpa: row.gpa,
        industry: row.industry,
        graduationDate: row.graduationDate,
        internshipCount: parseInt(String(row.internshipCount), 10),
        nilCount: parseInt(String(row.nilCount), 10),
        location: row.location,
      })
    );
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
    // Use MySQL to calculate month differences
    const query = `
      SELECT 
        AVG(
          GREATEST(0, 
            PERIOD_DIFF(
              DATE_FORMAT(application.terminalStatusDate, '%Y%m'),
              DATE_FORMAT(athlete.academicsGraduationdate, '%Y%m')
            )
          )
        ) as avgMonths
      FROM application
      INNER JOIN job ON application.jobId = job.id
      INNER JOIN athlete ON application.athleteId = athlete.id
      INNER JOIN school ON athlete.schoolRefId = school.id
      WHERE school.id = ?
        AND application.status = ?
        AND job.type = ?
        AND application.terminalStatusDate >= ?
        AND application.terminalStatusDate <= ?
        AND application.terminalStatusDate IS NOT NULL
        AND athlete.academicsGraduationdate IS NOT NULL
    `;

    const results = await this.applicationRepository.query(query, [
      schoolId,
      ApplicationStatus.accepted,
      JobType.JOB,
      startDate,
      endDate,
    ]);

    return Math.round(parseFloat(results[0]?.avgMonths || '0'));
  }

  private async calculateActiveJobSeekers(
    schoolId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    // Use a single query with NOT EXISTS subquery to count athletes without jobs
    const query = `
      SELECT COUNT(*) as count
      FROM athlete
      INNER JOIN school ON athlete.schoolRefId = school.id
      WHERE school.id = ?
        AND athlete.academicsGraduationdate >= ?
        AND athlete.academicsGraduationdate <= ?
        AND NOT EXISTS (
          SELECT 1 
          FROM application
          INNER JOIN job ON application.jobId = job.id
          WHERE application.athleteId = athlete.id
            AND application.status = ?
            AND job.type = ?
        )
    `;

    const results = await this.athleteRepository.query(query, [
      schoolId,
      startDate,
      endDate,
      ApplicationStatus.accepted,
      JobType.JOB,
    ]);

    return parseInt(String(results[0]?.count || '0'), 10);
  }
}
