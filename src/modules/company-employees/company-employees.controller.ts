import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyEmployee } from '../../entities';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IUpdateCompanyEmployeeInput } from '../../models/company-employee.models';

@Controller('companyEmployee')
export class CompanyEmployeesController {
  constructor(
    @InjectRepository(CompanyEmployee)
    private companyEmployeeRepository: Repository<CompanyEmployee>
  ) {}

  @Put('/')
  @UseGuards(JwtAuthGuard)
  async updateCompanyEmployee(
    @Request() req: { user?: { email: string } },
    @Body() updateDto: IUpdateCompanyEmployeeInput
  ) {
    try {
      const tokenEmail = req.user?.email;

      const companyEmployee = await this.companyEmployeeRepository.findOneBy({ email: tokenEmail });
      if (!companyEmployee) {
        throw new HttpException('Company employee not found', HttpStatus.NOT_FOUND);
      }

      Object.assign(companyEmployee, {
        firstName: updateDto.firstName ?? companyEmployee.firstName,
        lastName: updateDto.lastName ?? companyEmployee.lastName,
        position: updateDto.position ?? companyEmployee.position,
      });

      await this.companyEmployeeRepository.save(companyEmployee);
      return { message: 'Company employee updated successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update company employee',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  async getCompanyEmployee(@Param('id') id: string) {
    try {
      if (!id) {
        throw new HttpException('Invalid company employee ID', HttpStatus.BAD_REQUEST);
      }

      const companyEmployee = await this.companyEmployeeRepository.findOne({
        where: { id },
        relations: ['companyRef'],
      });

      if (!companyEmployee) {
        throw new HttpException('Company employee not found', HttpStatus.NOT_FOUND);
      }

      // Remove sensitive information
      const { password: _password, permission: _permission, ...safeEmployee } = companyEmployee;
      return safeEmployee;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to fetch company employee', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
