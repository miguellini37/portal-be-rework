import { Router } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../auth/authenticate';
import { db } from '../config/db';
import { School, SchoolEmployee, User } from '../entities';
import { USER_PERMISSIONS } from './users';

export const schoolEmployeeRoutes = Router();
const schoolEmployeeRepo = db.getRepository(SchoolEmployee);
const schoolRepo = db.getRepository(School);

export const createSchoolEmployee = async (input: SchoolEmployee): Promise<User> => {
  const schoolEmployee = schoolEmployeeRepo.create({
    ...input,
    permission: USER_PERMISSIONS.SCHOOL,
  });
  await schoolEmployee.save();

  const school = await createOrJoinSchool(schoolEmployee, input.schoolName);
  schoolEmployee.schoolRef = school;
  schoolEmployee.schoolName = school.schoolName;
  return await schoolEmployee.save();
};

const createOrJoinSchool = async (
  employee: SchoolEmployee,
  schoolName?: string
): Promise<School> => {
  if (!schoolName) {
    throw new Error('School is required on employee');
  }

  const existingSchool = await schoolRepo.findOne({
    where: { schoolName },
    relations: ['ownerRef'],
  });

  if (existingSchool) {
    return existingSchool;
  }

  const newSchool = schoolRepo.create({
    schoolName,
    ownerRef: employee,
  });
  await newSchool.save();

  return newSchool;
};

schoolEmployeeRoutes.put('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const tokenEmail = req.user?.email;

    const school = await schoolEmployeeRepo.findOneBy({ email: tokenEmail });
    if (!school) {
      return res.status(404).json({ error: 'School employee not found' });
    }

    Object.assign(school, {
      firstName: req.body.firstName ?? school.firstName,
      lastName: req.body.lastName ?? school.lastName,
      position: req.body.position ?? school.position,
    });

    await school.save();

    res.status(200).json({ message: 'School employee updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update school employee' });
  }
});

schoolEmployeeRoutes.get('/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Invalid school employee ID' });
    }

    const school = await schoolEmployeeRepo.findOneBy({ id });
    if (!school) {
      return res.status(404).json({ error: 'School employee not found' });
    }

    const { email, password, permission, ...rest } = school;
    res.status(200).json(rest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch school employee profile' });
  }
});
