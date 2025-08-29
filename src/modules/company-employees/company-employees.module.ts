import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyEmployee, Company } from '../../entities';
import { CompanyEmployeesController } from './company-employees.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyEmployee, Company])],
  controllers: [CompanyEmployeesController],
  providers: [],
})
export class CompanyEmployeesModule {}
