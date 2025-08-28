import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Application } from '../../entities/Application';
import { Job } from '../../entities/Job';
import { Athlete } from '../../entities/Athlete';
import { ICreateApplicationInput } from '../../models/athlete.models';
import { sanitizeUser } from '../../auth/utils';

@Controller('application')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(Athlete)
    private athleteRepository: Repository<Athlete>,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createApplication(@Request() req: any, @Body() createApplicationDto: ICreateApplicationInput) {
    const athleteId = req.user?.id;
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

  @Get()
  async getApplications(@Request() req: any) {
    const companyRefId = req.user?.companyRefId;
    const athleteId = req.user?.id;

    if (!athleteId && !companyRefId) {
      throw new BadRequestException('Missing user id');
    }

    const applications = await this.applicationRepository.find({
      where: { athlete: { id: athleteId }, job: { company: { id: companyRefId } } },
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