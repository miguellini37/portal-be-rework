import 'reflect-metadata';
import { DataSource } from 'typeorm';
import 'dotenv/config';
import {
  Athlete,
  Comment,
  Company,
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
  entities: [Athlete, Comment, Company, Job, Message, Post, School, SchoolEvent, User],
  migrations: ['../migrations/**/*.ts'],
  subscribers: [],
});
