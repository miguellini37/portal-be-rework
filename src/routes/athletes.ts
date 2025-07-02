import { Router } from 'express';
import { Athlete } from '../entities/Athlete';
import { authenticateToken, AuthenticatedRequest } from '../auth/authenticate';
import { db } from '../config/db';
import { School } from '../entities';

export const athleteRoutes = Router();
const athleteRepo = db.getRepository(Athlete);
const schoolRepo = db.getRepository(School);

athleteRoutes.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const athleteInput = req.body as Athlete;

    if (!athleteInput.email || !athleteInput.password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const existing = await Athlete.findOneBy({ email: athleteInput.email });
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }
    const school = await findSchool(req.body.schoolName);

    const athlete = athleteRepo.create({
      ...athleteInput,
      schools: school ? [school] : [],
      permission: 'athlete',
      graduationDate: athleteInput.graduationDate
        ? new Date(athleteInput.graduationDate)
        : undefined,
    });

    await athlete.save();
    res.status(201).json({
      id: athlete.id,
      email: athlete.email,
      permission: athlete.permission,
      firstName: athlete.firstName,
      lastName: athlete.lastName,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create athlete' });
  }
});

athleteRoutes.put('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const tokenEmail = req.user?.email;

    const athlete = await athleteRepo.findOneBy({ email: tokenEmail });
    if (!athlete) {
      return res.status(404).json({ error: 'Athlete not found' });
    }

    Object.assign(athlete, {
      firstName: req.body.firstName ?? athlete.firstName,
      lastName: req.body.lastName ?? athlete.lastName,
      sport: req.body.sport ?? athlete.sport,
      position: req.body.position ?? athlete.position,
      // school: req.body.school ?? athlete.school,
      major: req.body.major ?? athlete.major,
      gpa: req.body.gpa ?? athlete.gpa,
      division: req.body.division ?? athlete.division,
      accolades: req.body.accolades ?? athlete.accolades,
      teamRole: req.body.teamRole ?? athlete.teamRole,
      graduationDate: req.body.graduationDate
        ? new Date(req.body.graduationDate)
        : athlete.graduationDate,
      statistics: req.body.points ?? athlete.statistics,
    });

    await athlete.save();

    res.status(200).json({ message: 'Athlete updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update athlete' });
  }
});

athleteRoutes.get('/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Invalid athlete ID' });
    }

    const athlete = await athleteRepo.findOneBy({ id });
    if (!athlete) {
      return res.status(404).json({ error: 'Athlete not found' });
    }

    const { email, password, permission, ...athleteData } = athlete;
    res.status(200).json(athleteData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch athlete profile' });
  }
});

const findSchool = async (schoolName: string): Promise<School | null> => {
  const existingSchool = await schoolRepo.findOne({
    where: { schoolName },
  });

  return existingSchool;
};
