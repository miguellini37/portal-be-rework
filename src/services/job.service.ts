import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from '../entities/Job';
import { Company } from '../entities/Company';
import { CompanyEmployee } from '../entities/CompanyEmployee';
import { Application } from '../entities/Application';
import { ICreateJobInput, IUpdateJobInput, IJobQueryInput } from '../models/job.models';

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
    } catch (error) {
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
    } catch (error) {
      throw new Error('Failed to update job');
    }
  }

  async deleteJob(id: string) {
    try {
      const result = await this.jobRepository.delete(id);
      if (result.affected === 0) {
        throw new Error('Job not found');
      }
      return { message: 'Job deleted successfully' };
    } catch (error) {
      throw new Error('Failed to delete job');
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
      return job;
    } catch (error) {
      throw new Error('Job not found');
    }
  }

  async getJobs(query: IJobQueryInput, userId?: string, userPermission?: string) {
    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.company', 'company')
      .leftJoinAndSelect('job.owner', 'owner');

    if (query.type) {
      queryBuilder.where('job.type LIKE :term', { term: `%${query.type}%` });
    }

    if (query.wildcardTerm) {
      // if both type and wildcard are provided, chain with AND
      if (query.type) {
        queryBuilder.andWhere(
          '(job.position LIKE :wc OR job.description LIKE :wc OR company.companyName LIKE :wc)',
          { wc: `%${query.wildcardTerm}%` }
        );
      } else {
        queryBuilder.where(
          'job.position LIKE :wc OR job.description LIKE :wc OR company.companyName LIKE :wc',
          { wc: `%${query.wildcardTerm}%` }
        );
      }
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
    if (userPermission === 'athlete' && userId) {
      const existsSub = this.jobRepository
        .createQueryBuilder()
        .subQuery()
        .select('1')
        .from(Application, 'app')
        .where('app.jobId = job.id')
        .andWhere('app.athleteId = :athleteId')
        .getQuery();

      queryBuilder.addSelect(
        `CASE WHEN EXISTS (${existsSub}) THEN TRUE ELSE FALSE END`,
        'job_hasApplied'
      );

      const { entities: jobs, raw } = await queryBuilder
        .setParameters({ athleteId: userId })
        .getRawAndEntities();

      return jobs.map((job, i) => ({
        ...job,
        hasApplied: !!raw[i]['job_hasApplied'],
      }));
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
}
