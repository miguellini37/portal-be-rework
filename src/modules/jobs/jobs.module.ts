import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsController } from './jobs.controller';
import { Job } from '../../entities/Job';
import { Company } from '../../entities/Company';
import { CompanyEmployee } from '../../entities/CompanyEmployee';

@Module({
  imports: [TypeOrmModule.forFeature([Job, Company, CompanyEmployee])],
  controllers: [JobsController],
})
export class JobsModule {}