import { Router } from 'express';
import { Job } from '../entities/Job';
import { db } from '../config/db';
import { AuthenticatedRequest, authenticateToken } from '../auth/authenticate';
import { Company, CompanyEmployee } from '../entities';
import { FindOptionsWhere, In } from 'typeorm';

export const jobRoutes = Router();
const jobRepo = db.getRepository(Job);
const companyRepo = db.getRepository(Company);
const companyEmployeeRepo = db.getRepository(CompanyEmployee);

jobRoutes.post('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const jobData = req.body as Partial<Job>;

    const job = jobRepo.create(jobData);
    job.company = await findCompany(req.user?.companyRefId);
    job.owner = await findCompanyEmployee(req.user?.id);

    await jobRepo.save(job);

    res.status(201).json({ message: 'Job created successfully', job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

const findCompany = async (companyId?: string): Promise<Company> => {
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

const findCompanyEmployee = async (employeeId?: string): Promise<CompanyEmployee> => {
  if (!employeeId) {
    throw new Error('Job owner is required');
  }

  const existingEmployee = await companyEmployeeRepo.findOne({
    where: { id: employeeId },
  });

  if (!existingEmployee) {
    throw new Error('Job owner is required');
  }

  return existingEmployee;
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
      description: req.body.description ?? job.description,
      duration: req.body.duration ?? job.duration,
      industry: req.body.industry ?? job.industry,
      experience: req.body.experience ?? job.experience,
      applicationDeadline: req.body.applicationDeadline ?? job.applicationDeadline,
      benefits: req.body.benefits ?? job.benefits,
      athleteBenefits: req.body.athleteBenefits ?? job.athleteBenefits,
      type: req.body.type ?? job.type,
      requirements: req.body.requirements ?? job.requirements,
      tags: req.body.tags ?? job.tags,
      payment: req.body.payment ?? job.salary,
      paymentType: req.body.paymentType ?? job.paymentType,
      salary: req.body.salary ?? job.salary,
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

jobRoutes.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const companyId = req.user?.companyRefId;
    const type = req.query.type as string | string[] | undefined;

    const whereClause: FindOptionsWhere<Job> | FindOptionsWhere<Job>[] = [];

    if (companyId) {
      whereClause.push({ company: { id: companyId } });
    }

    let typeFilter;
    if (Array.isArray(type)) {
      typeFilter = In(type);
    } else if (typeof type === 'string') {
      typeFilter = type;
    }
    if (type) {
      whereClause.push({ type: typeFilter });
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
