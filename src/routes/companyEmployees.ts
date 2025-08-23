import { Router } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../auth/authenticate';
import { db } from '../config/db';
import { Company, CompanyEmployee, User } from '../entities';
import { USER_PERMISSIONS } from './users';
import { sanitizeUser } from '../auth/utils';


export const companyEmployeeRoutes = Router();
const companyEmployeeRepo = db.getRepository(CompanyEmployee);
const companyRepo = db.getRepository(Company);

export const createCompanyEmployee = async (input: CompanyEmployee): Promise<User> => {
  const companyEmployee = companyEmployeeRepo.create({
    ...input,
    permission: USER_PERMISSIONS.COMPANY,
  });
  await companyEmployee.save();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const company = await createOrJoinCompany(companyEmployee, (input as any).companyName);
  companyEmployee.companyRef = company;

  return await companyEmployee.save();
};

const createOrJoinCompany = async (
  employee: CompanyEmployee,
  companyName?: string
): Promise<Company> => {
  if (!companyName) {
    throw new Error('Company is required on employee');
  }

  const existingCompany = await companyRepo.findOne({
    where: { companyName },
    relations: ['ownerRef'],
  });

  if (existingCompany) {
    return existingCompany;
  }

  const newCompany = companyRepo.create({
    companyName,
    ownerRef: employee,
  });
  await newCompany.save();

  return newCompany;
};

companyEmployeeRoutes.put('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const tokenEmail = req.user?.email;

    const company = await companyEmployeeRepo.findOneBy({ email: tokenEmail });
    if (!company) {
      return res.status(404).json({ error: 'Company employee not found' });
    }

    Object.assign(company, {
      firstName: req.body.firstName ?? company.firstName,
      lastName: req.body.lastName ?? company.lastName,
      position: req.body.position ?? company.position,
    });

    await company.save();

    res.status(200).json({ message: 'Company employee updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update company employee' });
  }
});

companyEmployeeRoutes.get('/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Invalid company employee ID' });
    }

    const company = await companyEmployeeRepo.findOneBy({ id });
    if (!company) {
      return res.status(404).json({ error: 'Company employee not found' });
    }
    res.status(200).json(sanitizeUser(company));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch company employee profile' });
  }
});
