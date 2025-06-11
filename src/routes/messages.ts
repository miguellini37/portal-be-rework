import { Router } from 'express';
import { Message } from '../entities/Message';
import { User } from '../entities/User';
import { authenticateToken, AuthenticatedRequest } from '../auth/authenticate';
import { db } from '../config/db';

export const messageRoutes = Router();
const messageRepo = db.getRepository(Message);

messageRoutes.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;

  try {
    const messages = await messageRepo
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.fromUser', 'fromUser')
      .leftJoinAndSelect('message.toUser', 'toUser')
      .where('fromUser.id = :userId OR toUser.id = :userId', { userId })
      .orderBy('message.createdDate', 'DESC')
      .getMany();

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch messages' });
  }
});

messageRoutes.post('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  const { toUserId, message } = req.body;
  const fromUserId = req.user?.id;

  try {
    const fromUser = await User.findOneBy({ id: fromUserId });
    const toUser = await User.findOneBy({ id: toUserId });

    if (!fromUser || !toUser) return res.status(400).json({ error: 'User not found' });

    const newMessage = Message.create({
      fromUser,
      toUser,
      message,
      createdDate: new Date(),
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not send message' });
  }
});
