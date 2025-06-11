import dotenv from 'dotenv';
dotenv.config();

import express, { Application } from 'express';
import cors from 'cors';
import 'reflect-metadata';
import { db } from './config/db';
import { authRoutes } from './auth';
import { routes } from './routes';

const app: Application = express();
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Start DB and server
db.initialize()
  .then(() => {
    console.log('✅ Data Source has been initialized');

    app.get('/', (_req, res) => {
      res.status(200).json({ status: 'healthy' });
    });

    app.use('/auth', authRoutes);
    app.use('', routes);

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Error during Data Source initialization:', error);
    process.exit(1);
  });
