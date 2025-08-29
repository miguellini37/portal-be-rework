import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyEmployee } from '../entities';
import { IUpdateCompanyEmployeeInput } from '../models/company-employee.models';

@Injectable()
export class CompanyEmployeeService {
  constructor(
    @InjectRepository(CompanyEmployee)
    private companyEmployeeRepository: Repository<CompanyEmployee>
  ) {}

  async updateCompanyEmployee(userEmail: string, updateDto: IUpdateCompanyEmployeeInput) {
    try {
      const companyEmployee = await this.companyEmployeeRepository.findOneBy({ email: userEmail });
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

  async getCompanyEmployee(id: string) {
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
