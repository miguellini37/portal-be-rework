import { Router } from 'express';
import { Company } from '../entities/Company';
import { db } from '../config/db';

export const companyRoutes = Router();
const companyRepo = db.getRepository(Company);

// companyRoutes.post('/', async (req: AuthenticatedRequest, res) => {
//   try {
//     const { email, password, companyName, industry } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ error: 'Email and password are required.' });
//     }

//     const existing = await Company.findOneBy({ email });
//     if (existing) {
//       return res.status(400).json({ error: 'User with this email already exists.' });
//     }

//     const company = companyRepo.create({
//       email,
//       password,
//       permission: 'company',
//       companyName,
//       industry,
//     });

//     await company.save();
//     res.status(201).json({
//       id: company.id,
//       email: company.email,
//       permission: company.permission,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to create company' });
//   }
// });

// companyRoutes.put('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
//   try {
//     const tokenEmail = req.user?.email;

//     const company = await companyRepo.findOneBy({ email: tokenEmail });
//     if (!company) {
//       return res.status(404).json({ error: 'Company not found' });
//     }

//     Object.assign(company, {
//       companyName: req.body.companyName ?? company.companyName,
//       industry: req.body.industry ?? company.industry,
//     });

//     await company.save();

//     res.status(200).json({ message: 'Company updated successfully' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to update company' });
//   }
// });

// companyRoutes.get('/:id', authenticateToken, async (req, res) => {
//   try {
//     const id = parseInt(req.params.id);
//     if (isNaN(id)) {
//       return res.status(400).json({ error: 'Invalid company ID' });
//     }

//     const company = await companyRepo.findOneBy({ id });
//     if (!company) {
//       return res.status(404).json({ error: 'Company not found' });
//     }

//     const { email, password, ...rest } = company;
//     res.status(200).json(rest);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to fetch company profile' });
//   }
// });
