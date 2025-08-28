import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { Job } from '../../entities/Job';
import { Company } from '../../entities/Company';
import { CompanyEmployee } from '../../entities/CompanyEmployee';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ICreateJobInput, IUpdateJobInput, IJobQueryInput } from '../../models/job.models';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(CompanyEmployee)
    private companyEmployeeRepository: Repository<CompanyEmployee>,
  ) {}

  @Post('/')
  async createJob(@Request() req: any, @Body() createJobDto: ICreateJobInput) {
    try {
      const job = this.jobRepository.create(createJobDto);
      
      const company = await this.findCompany(req.user?.companyRefId);
      const owner = await this.findCompanyEmployee(req.user?.id);

      job.company = company;
      job.owner = owner;

      await this.jobRepository.save(job);
      return { message: 'Job created successfully', job };
    } catch (error) {
      throw new Error('Failed to create job');
    }
  }

  @Put('/:id')
  async updateJob(@Param('id') id: string, @Body() updateJobDto: IUpdateJobInput) {
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

  @Delete('/:id')
  async deleteJob(@Param('id') id: string) {
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

  @Get('/:id')
  async getJob(@Param('id') id: string) {
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

  @Get('/')
  async getJobs(@Query() query: IJobQueryInput) {
    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.company', 'company')
      .leftJoinAndSelect('job.owner', 'owner');

    if (query.wildcardTerm) {
      queryBuilder.where(
        'job.position LIKE :term OR job.description LIKE :term OR company.companyName LIKE :term',
        { term: `%${query.wildcardTerm}%` }
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