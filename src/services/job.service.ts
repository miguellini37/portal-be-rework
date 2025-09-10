import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm'; // added SelectQueryBuilder
import { Job, JobStatus } from '../entities/Job';
import { Company } from '../entities/Company';
import { CompanyEmployee } from '../entities/CompanyEmployee';
import { Application } from '../entities/Application';
import { ICreateJobInput, IUpdateJobInput, IJobQueryInput } from '../models/job.models';
import { USER_PERMISSIONS } from '../constants/user-permissions';
import { sanitizeUser } from './auth/utils';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(CompanyEmployee)
    private companyEmployeeRepository: Repository<CompanyEmployee>
  ) {}

  async createJob(userId: string, companyRefId: string | undefined, createJobDto: ICreateJobInput) {
    try {
      const job = this.jobRepository.create(createJobDto);

      const company = await this.findCompany(companyRefId);
      const owner = await this.findCompanyEmployee(userId);

      job.company = company;
      job.owner = owner;

      await this.jobRepository.save(job);
      return { message: 'Job created successfully', job };
    } catch {
      throw new Error('Failed to create job');
    }
  }

  async updateJob(id: string, updateJobDto: IUpdateJobInput) {
    try {
      const job = await this.jobRepository.findOneBy({ id });
      if (!job) {
        throw new Error('Job not found');
      }

      Object.assign(job, updateJobDto);
      await this.jobRepository.save(job);
      return { message: 'Job updated successfully' };
    } catch {
      throw new Error('Failed to update job');
    }
  }

  async getJob(id: string) {
    try {
      const job = await this.jobRepository.findOne({
        where: { id },
        relations: ['company', 'owner'],
      });
      if (!job) {
        throw new Error('Job not found');
      }
      const sanitizedOwner = job.owner ? sanitizeUser(job.owner) : undefined;
      return { ...job, owner: sanitizedOwner };
    } catch {
      throw new Error('Job not found');
    }
  }

  async getJobs(query: IJobQueryInput, userId: string, userPermission?: string) {
    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.company', 'company')
      .leftJoinAndSelect('job.owner', 'owner');

    if (query.type) {
      queryBuilder.where('job.type LIKE :term', { term: `%${query.type}%` });
    }

    // if both type and wildcard are provided, chain with AND
    if (query.wildcardTerm && query.type) {
      queryBuilder.andWhere(
        '(job.position LIKE :wc OR job.description LIKE :wc OR company.companyName LIKE :wc)',
        { wc: `%${query.wildcardTerm}%` }
      );
    } else if (query.wildcardTerm) {
      queryBuilder.where(
        'job.position LIKE :wc OR job.description LIKE :wc OR company.companyName LIKE :wc',
        { wc: `%${query.wildcardTerm}%` }
      );
    }

    if (query.companies?.length) {
      queryBuilder.andWhere('company.companyName IN (:...companies)', {
        companies: query.companies,
      });
    }

    if (query.industries?.length) {
      queryBuilder.andWhere('job.industry IN (:...industries)', {
        industries: query.industries,
      });
    }

    if (query.experiences?.length) {
      queryBuilder.andWhere('job.experience IN (:...experiences)', {
        experiences: query.experiences,
      });
    }

    if (query.durations?.length) {
      queryBuilder.andWhere('job.duration IN (:...durations)', {
        durations: query.durations,
      });
    }

    // For athletes, attach hasApplied boolean using an EXISTS subquery
    if (userPermission === USER_PERMISSIONS.ATHLETE) {
      return await this.getJobsWithHasAppliedFlag(queryBuilder, userId);
    }

    // Non-athletes: regular list (no flag)
    return await queryBuilder.getMany();
  }

  private async findCompany(companyId?: string): Promise<Company> {
    if (!companyId) {
      throw new Error('Company ID is required');
    }
    const company = await this.companyRepository.findOneBy({ id: companyId });
    if (!company) {
      throw new Error('Company not found');
    }
    return company;
  }

  private async findCompanyEmployee(userId?: string): Promise<CompanyEmployee> {
    if (!userId) {
      throw new Error('User ID is required');
    }
    const employee = await this.companyEmployeeRepository.findOneBy({ id: userId });
    if (!employee) {
      throw new Error('Company employee not found');
    }
    return employee;
  }

  // Returns the EXISTS subquery that checks if the current athlete applied to the job row
  private buildHasAppliedExistsSql(queryBuilder: SelectQueryBuilder<Job>): string {
    return queryBuilder
      .subQuery()
      .select('1')
      .from(Application, 'app')
      .where('app.jobId = job.id')
      .andWhere('app.athleteId = :athleteId')
      .getQuery();
  }

  // Adds selection for hasApplied and maps results to include the boolean flag
  private async getJobsWithHasAppliedFlag(
    queryBuilder: SelectQueryBuilder<Job>,
    athleteId: string
  ): Promise<Array<Omit<Job, keyof Job> & Partial<Job> & { hasApplied: boolean }>> {
    /* Explanation:
      We add a selection that uses the EXISTS subquery to determine if the athlete has applied.
      The result is aliased as 'job_hasApplied' which will be '1' if true, else '0'.
      After executing the query, we map over the results to convert '1'/'0' to boolean true/false.
      This avoids front end erroring where user apply to jobs they have already applied to.
      Also allows filtering in the future if needed.
    */
    const hasAppliedExistsSql = this.buildHasAppliedExistsSql(queryBuilder);

    queryBuilder.addSelect(
      `CASE WHEN EXISTS (${hasAppliedExistsSql}) THEN 1 ELSE 0 END`,
      'job_hasApplied'
    );
    queryBuilder.andWhere('job.status <> :closedStatus', { closedStatus: JobStatus.closed });

    const { entities: jobs, raw: rawRows } = await queryBuilder
      .setParameters({ athleteId })
      .getRawAndEntities();

    return jobs.map((job, i) => {
      const hasAppliedRaw = rawRows[i]['job_hasApplied'];
      const hasApplied = hasAppliedRaw === '1';
      return {
        ...job,
        hasApplied,
      };
    });
  }
}
