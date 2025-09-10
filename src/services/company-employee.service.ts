import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyEmployee } from '../entities';
import { Company } from '../entities/Company';
import { User } from '../entities/User';
import {
  IUpdateCompanyEmployeeInput,
  ICreateCompanyEmployeeInput,
} from '../models/company-employee.models';
import { USER_PERMISSIONS } from '../constants/user-permissions';

@Injectable()
export class CompanyEmployeeService {
  constructor(
    @InjectRepository(CompanyEmployee)
    private companyEmployeeRepository: Repository<CompanyEmployee>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>
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

  async createCompanyEmployee(input: ICreateCompanyEmployeeInput): Promise<User> {
    try {
      let company = await this.companyRepository.findOne({
        where: { companyName: input.companyName },
      });

      if (!company) {
        company = await this.companyRepository.save(
          this.companyRepository.create({ companyName: input.companyName })
        );
      }

      const companyEmployee = this.companyEmployeeRepository.create({
        ...input,
        companyRef: company ?? undefined,
        permission: USER_PERMISSIONS.COMPANY,
      });

      const saved = await this.companyEmployeeRepository.save(companyEmployee);

      await this.companyRepository.save({
        ...company,
        ownerRef: companyEmployee,
      });
      return saved;
    } catch (err) {
      console.error(err);
      throw new HttpException(
        'Failed to create company employee',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
