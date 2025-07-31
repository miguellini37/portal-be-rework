import { Router } from 'express';
import { Job } from '../entities/Job';
import { db } from '../config/db';
import { AuthenticatedRequest, authenticateToken } from '../auth/authenticate';
import { Company } from '../entities';

export const jobRoutes = Router();
const jobRepo = db.getRepository(Job);
const companyRepo = db.getRepository(Company);

jobRoutes.post('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const jobData = req.body as Partial<Job>;

    const company = await findCompany(req.body.companyId);

    const job = jobRepo.create(jobData);
    job.company = company;
    await jobRepo.save(job);

    res.status(201).json({ message: 'Job created successfully', job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

const findCompany = async (companyId: string): Promise<Company> => {
  if (!companyId) {
    throw new Error('Company is required on job');
  }

  const existingCompany = await companyRepo.findOne({
    where: { id: companyId },
  });

  if (!existingCompany) {
    throw new Error('Company is required on job');
  }

  return existingCompany;
};

jobRoutes.put('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const jobId = req.body?.id;
    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required for update' });
    }

    const job = await jobRepo.findOneBy({ id: jobId });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    Object.assign(job, {
      position: req.body.position ?? job.position,
      location: req.body.location ?? job.location,
      salary: req.body.salary ?? job.salary,
      benefit: req.body.benefit ?? job.benefit,
      description: req.body.description ?? job.description,
      requirements: req.body.requirements ?? job.requirements,
      type: req.body.type ?? job.type,
    });

    await job.save();

    res.status(200).json({ message: 'Job updated successfully', job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

jobRoutes.get('/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Invalid job ID' });
    }

    const job = await jobRepo.findOne({
      where: { id },
      relations: ['company'],
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.status(200).json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch job profile' });
  }
});

jobRoutes.get('/', authenticateToken, async (req, res) => {
  try {
    const companyId = req.query.companyId as string | undefined;
    const type = req.query.type as string | undefined;

    // Build where clause step by step
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};

    if (companyId) {
      whereClause.company = { id: companyId };
    }

    if (type) {
      whereClause.type = type;
    }

    const jobs = await jobRepo.find({
      where: whereClause,
      relations: ['company'],
      order: { position: 'ASC' },
    });

    res.status(200).json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});
