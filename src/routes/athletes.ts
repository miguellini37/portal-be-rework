import { Router } from 'express';
import { Athlete } from '../entities/Athlete';
import { authenticateToken, AuthenticatedRequest } from '../auth/authenticate';
import { db } from '../config/db';

export const athleteRoutes = Router();
const athleteRepo = db.getRepository(Athlete);

athleteRoutes.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      sport,
      position,
      school,
      major,
      gpa,
      division,
      accolades,
      teamRole,
      coachability,
      industry,
      graduationDate,
      points,
      assists,
      jobTitle,
      company,
      location,
      description,
      //   internshipIds,
      //   schoolRefId,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const existing = await Athlete.findOneBy({ email });
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const athlete = athleteRepo.create({
      email,
      password,
      permission: 'athlete',
      firstName,
      lastName,
      sport,
      position,
      school,
      major,
      gpa,
      division,
      accolades,
      teamRole,
      coachability,
      industry,
      graduationDate: graduationDate ? new Date(graduationDate) : undefined,
      points,
      assists,
      jobTitle,
      company,
      location,
      description,
      //   internshipIds,
      //   schoolRefId,
    });

    // if (schoolRefId) {
    //   const schoolEntity = await School.findOneBy({ id: schoolRefId });
    //   if (!schoolEntity) return res.status(400).json({ error: 'Invalid school ID' });
    //   athlete.schoolRef = schoolEntity;
    // }

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
    const {
      email,
      password,
      firstName,
      lastName,
      sport,
      position,
      school,
      major,
      gpa,
      division,
      accolades,
      teamRole,
      coachability,
      industry,
      graduationDate,
      points,
      assists,
      jobTitle,
      company,
      location,
      description,
      //   internshipIds,
      //   schoolRefId,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const existing = await Athlete.findOneBy({ email });
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const athlete = athleteRepo.create({
      email,
      password,
      permission: 'athlete',
      firstName,
      lastName,
      sport,
      position,
      school,
      major,
      gpa,
      division,
      accolades,
      teamRole,
      coachability,
      industry,
      graduationDate: graduationDate ? new Date(graduationDate) : undefined,
      points,
      assists,
      jobTitle,
      company,
      location,
      description,
      //   internshipIds,
      // schoolRefId
    });

    // if (schoolRefId) {
    //   const schoolEntity = await School.findOneBy({ id: schoolRefId });
    //   if (!schoolEntity) return res.status(400).json({ error: 'Invalid school ID' });
    //   athlete.schoolRef = schoolEntity;
    // }

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
