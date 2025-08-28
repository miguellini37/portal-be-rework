import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application, Job, Athlete } from '../../entities';
import { ApplicationsController } from './applications.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Application, Job, Athlete])],
  controllers: [ApplicationsController],
})
export class ApplicationsModule {}