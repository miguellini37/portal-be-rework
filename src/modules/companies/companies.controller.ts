import { Controller, Get, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../../entities/Company';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IUpdateCompanyInput, ICompanyQueryInput } from '../../models/company.models';

@Controller('company')
@UseGuards(JwtAuthGuard)
export class CompaniesController {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  @Put('/')
  async updateCompany(@Request() req: any, @Body() updateCompanyDto: IUpdateCompanyInput) {
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
    } catch (error) {
      throw new Error('Failed to update company');
    }
  }

  @Get('/:id')
  async getCompany(@Param('id') id: string) {
    try {
      const company = await this.companyRepository.findOneBy({ id });
      if (!company) {
        throw new Error('Company not found');
      }
      return company;
    } catch (error) {
      throw new Error('Company not found');
    }
  }

  @Get('/')
  async getCompanies(@Query() query: ICompanyQueryInput) {
    const queryBuilder = this.companyRepository.createQueryBuilder('company');

    if (query.wildcardTerm) {
      queryBuilder.where(
        'company.companyName LIKE :term OR company.industry LIKE :term',
        { term: `%${query.wildcardTerm}%` }
      );
    }

    if (query.industry) {
      queryBuilder.andWhere('company.industry = :industry', { industry: query.industry });
    }

    return await queryBuilder.getMany();
  }
}