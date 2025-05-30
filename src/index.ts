import express, { Application } from 'express';
import cors from 'cors';
import 'reflect-metadata';
import { db } from './config/db';
import dotenv from 'dotenv';
import userRoutes from './routes/users';
dotenv.config();

const app: Application = express();
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Start DB and server
db.initialize()
  .then(() => {
    console.log('✅ Data Source has been initialized');

    app.use('/users', userRoutes); // ✅ DO NOT CALL userRoutes()

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Error during Data Source initialization:', error);
    process.exit(1);
  });
