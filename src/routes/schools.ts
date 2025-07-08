import { Router } from 'express';
import { School } from '../entities/School';
import { db } from '../config/db';
import { AuthenticatedRequest, authenticateToken } from '../auth/authenticate';

export const schoolRoutes = Router();
const schoolRepo = db.getRepository(School);

schoolRoutes.put('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const schoolId = req.body?.id;
    const school = await schoolRepo.findOneBy({ id: schoolId });
    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }
    Object.assign(school, {
      schoolName: req.body.schoolName ?? school.schoolName,
    });
    await school.save();
    res.status(200).json({ message: 'School updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update school' });
  }
});

schoolRoutes.get('/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Invalid school ID' });
    }

    const school = await schoolRepo.findOneBy({ id });
    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    res.status(200).json(school);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch school profile' });
  }
});
