import { Router } from 'express';
import { School } from '../entities/School';
import { db } from '../config/db';

export const schoolRoutes = Router();
const schoolRepo = db.getRepository(School);

// schoolRoutes.post('/', async (req: AuthenticatedRequest, res) => {
//   try {
//     const { email, password, schoolName } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ error: 'Email and password are required.' });
//     }

//     const existing = await School.findOneBy({ email });
//     if (existing) {
//       return res.status(400).json({ error: 'User with this email already exists.' });
//     }

//     const school = schoolRepo.create({
//       email,
//       password,
//       permission: 'school',
//       schoolName,
//     });

//     await school.save();
//     res.status(201).json({
//       id: school.id,
//       email: school.email,
//       permission: school.permission,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to create school' });
//   }
// });

// schoolRoutes.put('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
//   try {
//     const tokenEmail = req.user?.email;

//     const school = await schoolRepo.findOneBy({ email: tokenEmail });
//     if (!school) {
//       return res.status(404).json({ error: 'School not found' });
//     }

//     Object.assign(school, {
//       schoolName: req.body.schoolName ?? school.schoolName,
//     });

//     await school.save();

//     res.status(200).json({ message: 'School updated successfully' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to update school' });
//   }
// });

// schoolRoutes.get('/:id', authenticateToken, async (req, res) => {
//   try {
//     const id = parseInt(req.params.id);
//     if (isNaN(id)) {
//       return res.status(400).json({ error: 'Invalid school ID' });
//     }

//     const school = await schoolRepo.findOneBy({ id });
//     if (!school) {
//       return res.status(404).json({ error: 'School not found' });
//     }

//     const { email, password, permission, ...rest } = school;
//     res.status(200).json(rest);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to fetch school profile' });
//   }
// });
