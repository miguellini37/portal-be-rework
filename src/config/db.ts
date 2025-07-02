import 'reflect-metadata';
import { DataSource } from 'typeorm';
import 'dotenv/config';
import {
  Athlete,
  Comment,
  Company,
  CompanyEmployee,
  SchoolEmployee,
  Job,
  Message,
  Post,
  School,
  SchoolEvent,
  User,
} from '../entities';

export const db = new DataSource({
  type: 'mysql',
  host: process.env.DB_ENDPOINT ?? 'localhost',
  port: 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: false,
  entities: [
    User,
    Athlete,
    CompanyEmployee,
    SchoolEmployee,
    Comment,
    Company,
    Job,
    Message,
    School,
    Post,
    SchoolEvent,
  ],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: [],
});
