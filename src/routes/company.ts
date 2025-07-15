import { Router } from 'express';
import { Company } from '../entities/Company';
import { db } from '../config/db';
import { AuthenticatedRequest, authenticateToken } from '../auth/authenticate';

export const companyRoutes = Router();
const companyRepo = db.getRepository(Company);

companyRoutes.put('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const companyId = req.body?.id;
    const company = await companyRepo.findOneBy({ id: companyId });
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    Object.assign(company, {
      companyName: req.body.companyName ?? company.companyName,
      industry: req.body.industry ?? company.industry,
    });
    await company.save();
    res.status(200).json({ message: 'Company updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update company' });
  }
});

companyRoutes.get('/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Invalid company ID' });
    }

    const company = await companyRepo.findOne({
      where: { id },
      relations: ['jobs'],
    });
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.status(200).json(company);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch company profile' });
  }
});

companyRoutes.get('/', async (req, res) => {
  try {
    const companies = await companyRepo.find({
      select: ['id', 'companyName'],
    });

    res.status(200).json(companies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});
