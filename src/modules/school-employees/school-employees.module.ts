import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolEmployeesController } from './school-employees.controller';
import { SchoolEmployee } from '../../entities/SchoolEmployee';
import { School } from '../../entities/School';

@Module({
  imports: [TypeOrmModule.forFeature([SchoolEmployee, School])],
  controllers: [SchoolEmployeesController],
})
export class SchoolEmployeesModule {}
