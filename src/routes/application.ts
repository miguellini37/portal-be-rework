import { Router } from 'express';
import { Application } from '../entities/Application';
import { db } from '../config/db';
import { authenticateToken, AuthenticatedRequest } from '../auth/authenticate';
import { Job } from '../entities/Job';
import { Athlete } from '../entities/Athlete';
import { sanitizeUser } from '../auth/utils';

export const applicationRoutes = Router();
const applicationRepo = db.getRepository(Application);
const jobRepo = db.getRepository(Job);
const athleteRepo = db.getRepository(Athlete);

applicationRoutes.post('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const athleteId = req.user?.id;
    const { jobId } = req.body;
    if (!jobId || !athleteId) {
      return res.status(400).json({ error: 'jobId and athleteId are required' });
    }

    const job = await jobRepo.findOneBy({ id: jobId });
    const athlete = await athleteRepo.findOneBy({ id: athleteId });
    if (!job || !athlete) {
      return res.status(404).json({ error: 'Job or Athlete not found' });
    }

    const application = applicationRepo.create({
      job,
      athlete,
    });
    await applicationRepo.save(application);

    res.status(201).json({ message: 'Application created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create application' });
  }
});

applicationRoutes.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const companyRefId = req.user?.companyRefId;
    const athleteId = req.user?.id;
    if (!athleteId && !companyRefId) {
      return res.status(400).json({ error: 'Missing user id' });
    }

    const applications = await applicationRepo.find({
      where: { athlete: { id: athleteId }, job: { company: { id: companyRefId } } },
      relations: ['job', 'job.company', 'athlete'],
      order: { creationDate: 'DESC' },
    });
    const sanitized = applications.map((app) => ({
      ...app,
      athlete: sanitizeUser(app.athlete),
    }));
    res.status(200).json(sanitized);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});
