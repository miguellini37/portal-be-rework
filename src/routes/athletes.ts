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
      school: req.body.school ?? athlete.school,
      major: req.body.major ?? athlete.major,
      gpa: req.body.gpa ?? athlete.gpa,
      division: req.body.division ?? athlete.division,
      accolades: req.body.accolades ?? athlete.accolades,
      teamRole: req.body.teamRole ?? athlete.teamRole,
      coachability: req.body.coachability ?? athlete.coachability,
      industry: req.body.industry ?? athlete.industry,
      graduationDate: req.body.graduationDate
        ? new Date(req.body.graduationDate)
        : athlete.graduationDate,
      points: req.body.points ?? athlete.points,
      assists: req.body.assists ?? athlete.assists,
      jobTitle: req.body.jobTitle ?? athlete.jobTitle,
      company: req.body.company ?? athlete.company,
      location: req.body.location ?? athlete.location,
      description: req.body.description ?? athlete.description,
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
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
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
