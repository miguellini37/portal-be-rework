import 'reflect-metadata';
import { DataSource } from 'typeorm';

export const db = new DataSource({
  type: 'mysql',
  host: process.env.DB_ENDPOINT ?? 'localhost',
  port: 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: false,
  entities: ['src/entities/**/*.ts'],
  migrations: ['src/migration/**/*.ts'],
  subscribers: [],
});
