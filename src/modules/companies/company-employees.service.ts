import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyEmployee, Company, User } from '../../entities';
import { USER_PERMISSIONS } from '../../constants/user-permissions';

@Injectable()
export class CompanyEmployeesService {
  constructor(
    @InjectRepository(CompanyEmployee)
    private companyEmployeeRepository: Repository<CompanyEmployee>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>
  ) {}

  // Add other company employee-related methods here as needed
}

export const createCompanyEmployee = async (input: any): Promise<User> => {
  // This is a temporary export to maintain compatibility
  // This should be moved to the service class
  const { db } = await import('../../config/db');
  const companyEmployeeRepo = db.getRepository(CompanyEmployee);
  const companyRepo = db.getRepository(Company);

  const company = await companyRepo.findOne({
    where: { companyName: input.companyName },
  });

  const companyEmployee = companyEmployeeRepo.create({
    ...input,
    companyRef: company ?? undefined,
    permission: USER_PERMISSIONS.COMPANY,
  });

  const saved = await companyEmployeeRepo.save(companyEmployee);
  return saved as unknown as User;
};
