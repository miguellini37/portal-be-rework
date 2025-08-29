import dotenv from 'dotenv';
dotenv.config();

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cors from '@fastify/cors';
import fastifySensible from '@fastify/sensible';
import rateLimit from '@fastify/rate-limit';
import fastifyPressure from '@fastify/under-pressure';
import ms from 'ms';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true })
  );

  // Register Fastify plugins
  await app.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  });

  await app.register(fastifySensible);

  await app.register(rateLimit, {
    max: 1000,
    timeWindow: ms('1s'),
  });

  await app.register(fastifyPressure, {
    exposeStatusRoute: '/health',
  });

  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe());

  const PORT = process.env.PORT || 3000;

  await app.listen(PORT, '0.0.0.0');
  console.log(`🚀 Server running at http://localhost:${PORT}`);
}

bootstrap().catch((error) => {
  console.error('❌ Error during application startup:', error);
  process.exit(1);
});
