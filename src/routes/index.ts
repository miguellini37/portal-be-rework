import { Router } from 'express';
import { athleteRoutes } from './athletes';
import { messageRoutes } from './messages';
import { userRoutes } from './users';

export const routes = Router();

routes.use('/users', userRoutes);
routes.use('/athlete', athleteRoutes);
routes.use('/messages', messageRoutes);
