import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolEventsController } from './school-events.controller';
import { SchoolEvent } from '../../entities/SchoolEvent';
import { School } from '../../entities/School';

@Module({
  imports: [TypeOrmModule.forFeature([SchoolEvent, School])],
  controllers: [SchoolEventsController],
})
export class SchoolEventsModule {}
