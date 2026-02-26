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

  async updateCompany(updateCompanyInput: IUpdateCompanyInput) {
    try {
      const companyId = updateCompanyInput.id;
      const company = await this.companyRepository.findOneBy({ id: companyId });

      if (!company) {
        throw new Error('Company not found');
      }

      Object.assign(company, {
        companyName: updateCompanyInput.companyName ?? company.companyName,
        industry: updateCompanyInput.industry ?? company.industry,
        culture: {
          ...company.culture,
          ...updateCompanyInput.culture,
        },
        benefits: {
          ...company.benefits,
          ...updateCompanyInput.benefits,
        },
        recruiting: {
          ...company.recruiting,
          ...updateCompanyInput.recruiting,
        },
      });

      await this.companyRepository.save(company);
      return { message: 'Company updated successfully' };
    } catch {
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
        companyEmployees: company.companyEmployees?.filter((employee) => {
          return employee.isVerified;
        }),
      };

      return safeCompany;
    } catch {
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

  async getCompaniesForDropdown() {
    const queryBuilder = this.companyRepository
      .createQueryBuilder('company')
      .select(['company.id', 'company.companyName'])
      .orderBy('company.companyName', 'ASC')
      .take(15);

    return await queryBuilder.getMany();
  }
}
