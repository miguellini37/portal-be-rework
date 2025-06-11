import { Router, Request, Response } from 'express';
import { db } from '../config/db';
import { User } from '../entities/User';

export const userRoutes = Router();
const userRepo = db.getRepository(User);

// POST /users - Create a new user
userRoutes.post('/', async (req: Request, res: Response) => {
  try {
    const { email, password, permission } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Check for duplicate email
    const existingUser = await userRepo.findOneBy({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use.' });
    }

    // Create and save new user
    const newUser = userRepo.create({ email, password, permission });
    const savedUser = await userRepo.save(newUser);

    // Exclude password from the response
    const { password: _, ...userWithoutPassword } = savedUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Failed to create user:', error);
    res.status(500).json({ error: 'Server error while creating user.' });
  }
});
