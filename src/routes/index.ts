import { Router } from 'express';
import { athleteRoutes } from './athletes';
import { messageRoutes } from './messages';
import { userRoutes } from './users';
import { companyRoutes } from './company';
import { schoolRoutes } from './schools';

export const routes = Router();

routes.use('/users', userRoutes);
routes.use('/athlete', athleteRoutes);
routes.use('/companies', companyRoutes);
routes.use('/schools', schoolRoutes);

routes.use('/messages', messageRoutes);
