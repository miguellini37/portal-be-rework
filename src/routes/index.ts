import { Router } from 'express';
import { athleteRoutes } from './athletes';
import { messageRoutes } from './messages';
import { userRoutes } from './users';
import { companyRoutes } from './company';
import { schoolRoutes } from './schools';
import { companyEmployeeRoutes } from './companyEmployees';
import { schoolEmployeeRoutes } from './schoolsEmployees';
import { jobRoutes } from './jobs';

export const routes = Router();

routes.use('/user', userRoutes);
routes.use('/athlete', athleteRoutes);
routes.use('/companyEmployee', companyEmployeeRoutes);
routes.use('/schoolEmployee', schoolEmployeeRoutes);

routes.use('/company', companyRoutes);
routes.use('/school', schoolRoutes);

routes.use('/job', jobRoutes);

routes.use('/messages', messageRoutes);
