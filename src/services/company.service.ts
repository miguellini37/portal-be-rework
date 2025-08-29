import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../entities/Company';
import { IUpdateCompanyInput, ICompanyQueryInput } from '../models/company.models';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>
  ) {}

  async updateCompany(updateCompanyDto: IUpdateCompanyInput) {
    try {
      const companyId = updateCompanyDto.id;
      const company = await this.companyRepository.findOneBy({ id: companyId });

      if (!company) {
        throw new Error('Company not found');
      }

      Object.assign(company, {
        companyName: updateCompanyDto.companyName ?? company.companyName,
        industry: updateCompanyDto.industry ?? company.industry,
        culture: {
          ...company.culture,
          ...updateCompanyDto.culture,
        },
        benefits: {
          ...company.benefits,
          ...updateCompanyDto.benefits,
        },
        recruiting: {
          ...company.recruiting,
          ...updateCompanyDto.recruiting,
        },
      });

      await this.companyRepository.save(company);
      return { message: 'Company updated successfully' };
    } catch (_error) {
      throw new Error('Failed to update company');
    }
  }

  async getCompany(id: string) {
    try {
      const company = await this.companyRepository.findOne({
        where: { id },
        relations: ['jobs', 'companyEmployees'],
      });
      if (!company) {
        throw new Error('Company not found');
      }

      // Strip password and permission from employees
      const safeCompany = {
        ...company,
        companyEmployees: company.companyEmployees?.map((employee) => {
          const { password: _password, permission: _permission, ...safeEmployee } = employee;
          return safeEmployee;
        }),
      };

      return safeCompany;
    } catch (_error) {
      throw new Error('Company not found');
    }
  }

  async getCompanies(query: ICompanyQueryInput) {
    const queryBuilder = this.companyRepository
      .createQueryBuilder('company')
      .select(['company.id', 'company.companyName', 'company.industry'])
      .leftJoinAndSelect('company.jobs', 'jobs');

    if (query.wildcardTerm) {
      queryBuilder.where('company.companyName LIKE :term OR company.industry LIKE :term', {
        term: `%${query.wildcardTerm}%`,
      });
    }

    if (query.industry) {
      queryBuilder.andWhere('company.industry = :industry', { industry: query.industry });
    }

    return await queryBuilder.getMany();
  }
}
