import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../entities/Application';
import { Job } from '../entities/Job';
import { Athlete } from '../entities/Athlete';
import { ICreateApplicationInput } from '../models/athlete.models';
import { sanitizeUser } from './auth/utils';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(Athlete)
    private athleteRepository: Repository<Athlete>
  ) {}

  async createApplication(athleteId: string, createApplicationDto: ICreateApplicationInput) {
    const { jobId } = createApplicationDto;

    if (!jobId || !athleteId) {
      throw new BadRequestException('jobId and athleteId are required');
    }

    const job = await this.jobRepository.findOneBy({ id: jobId });
    const athlete = await this.athleteRepository.findOneBy({ id: athleteId });

    if (!job || !athlete) {
      throw new NotFoundException('Job or Athlete not found');
    }

    // Prevent duplicate applications
    const existing = await this.applicationRepository.findOne({
      where: { job: { id: jobId }, athlete: { id: athleteId } },
    });

    if (existing) {
      throw new ConflictException('You have already applied to this job.');
    }

    const application = this.applicationRepository.create({
      job,
      athlete,
    });

    await this.applicationRepository.save(application);
    return { message: 'Application created successfully' };
  }

  async getApplications(userId: string, companyRefId?: string) {
    const athleteId = userId;

    if (!athleteId && !companyRefId) {
      throw new BadRequestException('Missing user id');
    }

    const whereCondition: { athlete?: { id: string }; job?: { company: { id: string } } } = {};

    if (athleteId) {
      whereCondition.athlete = { id: athleteId };
    }

    if (companyRefId) {
      whereCondition.job = { company: { id: companyRefId } };
    }

    const applications = await this.applicationRepository.find({
      where: whereCondition,
      relations: ['job', 'job.company', 'athlete'],
      order: { creationDate: 'DESC' },
    });

    const sanitized = applications.map((app) => ({
      ...app,
      athlete: sanitizeUser(app.athlete),
    }));

    return sanitized;
  }
}
