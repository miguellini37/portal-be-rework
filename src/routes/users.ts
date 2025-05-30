import { Router, Request, Response } from 'express';
import { db } from '../config/db';
import { User } from '../entities/User';

const router = Router();
const userRepo = db.getRepository(User);

// GET /users - Get all users
router.get('/', async (_req: Request, res: Response) => {
  try {
    const users = await userRepo.find();
    res.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /users/:id - Get user by ID
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid user ID' });

    const user = await userRepo.findOneBy({ id });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /users - Create a new user
router.post('/', async (req: Request, res: Response) => {
  try {
    // You might want to validate req.body here
    const newUser = userRepo.create(req.body);
    const savedUser = await userRepo.save(newUser);
    res.status(201).json(savedUser);
  } catch (error) {
    console.error('Failed to create user:', error);
    res.status(400).json({ error: 'Invalid user data' });
  }
});

// PUT /users/:id - Update a user by ID
router.put('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid user ID' });

    const user = await userRepo.findOneBy({ id });
    if (!user) return res.status(404).json({ error: 'User not found' });

    userRepo.merge(user, req.body);
    const updatedUser = await userRepo.save(user);
    res.json(updatedUser);
  } catch (error) {
    console.error('Failed to update user:', error);
    res.status(400).json({ error: 'Invalid update data' });
  }
});

// DELETE /users/:id - Delete user by ID
router.delete('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid user ID' });

    const result = await userRepo.delete(id);
    if (result.affected === 0) return res.status(404).json({ error: 'User not found' });

    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
