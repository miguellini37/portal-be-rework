import 'reflect-metadata';
import { DataSource } from 'typeorm';
import 'dotenv/config';
import {
  Athlete,
  Company,
  CompanyEmployee,
  SchoolEmployee,
  Job,
  School,
  User,
  Interview,
  Activity,
  EmailWhitelist,
  Message,
} from '../entities';
import { Application } from '../entities/Application';

export const db = new DataSource({
  type: 'mysql',
  host: process.env.DB_ENDPOINT ?? 'localhost',
  port: 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: false,
  timezone: 'Z',
  entities: [
    User,
    Athlete,
    CompanyEmployee,
    SchoolEmployee,
    Company,
    Job,
    School,
    Application,
    Interview,
    Activity,
    EmailWhitelist,
    Message,
  ],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: [],
});
