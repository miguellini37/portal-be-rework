import { Router } from 'express';
import { AuthenticatedRequest } from '../auth/authenticate';
import { Athlete } from '../entities';
import { createAthlete } from './athletes';
import { createSchoolEmployee } from './schoolsEmployees';
import { createCompanyEmployee } from './companyEmployees';

export enum USER_PERMISSIONS {
  ATHLETE = 'athlete',
  COMPANY = 'company',
  SCHOOL = 'school',
}

export const userRoutes = Router();

userRoutes.post('/register', async (req: AuthenticatedRequest, res) => {
  try {
    const userInput = req.body;

    if (!userInput.email || !userInput.password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const existing = await Athlete.findOneBy({ email: userInput.email });
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    console.log('Creating user with input:', userInput);

    let user;
    switch (userInput.permission) {
      case USER_PERMISSIONS.ATHLETE:
        user = createAthlete(userInput);
        break;

      case USER_PERMISSIONS.SCHOOL:
        user = createSchoolEmployee(userInput);
        break;

      case USER_PERMISSIONS.COMPANY:
        user = createCompanyEmployee(userInput);
        break;

      default:
        throw new Error('User type not defined');
    }

    res.status(200).json({ message: 'Account created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});
