import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolEmployee, School, User } from '../../entities';
import { USER_PERMISSIONS } from '../../constants/user-permissions';

@Injectable()
export class SchoolEmployeesService {
  constructor(
    @InjectRepository(SchoolEmployee)
    private schoolEmployeeRepository: Repository<SchoolEmployee>,
    @InjectRepository(School)
    private schoolRepository: Repository<School>
  ) {}

  // Add other school employee-related methods here as needed
}

export const createSchoolEmployee = async (input: any): Promise<User> => {
  // This is a temporary export to maintain compatibility
  // This should be moved to the service class
  const { db } = await import('../../config/db');
  const schoolEmployeeRepo = db.getRepository(SchoolEmployee);
  const schoolRepo = db.getRepository(School);

  const school = await schoolRepo.findOne({
    where: { schoolName: input.schoolName },
  });

  const schoolEmployee = schoolEmployeeRepo.create({
    ...input,
    schoolRef: school ?? undefined,
    permission: USER_PERMISSIONS.SCHOOL,
  });

  const saved = await schoolEmployeeRepo.save(schoolEmployee);
  return saved as unknown as User;
};
