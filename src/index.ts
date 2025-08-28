import dotenv from 'dotenv';
dotenv.config();

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as ms from 'ms';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true })
  );

  // Register Fastify plugins
  await app.register(require('@fastify/cors'), {
    origin: '*',
    credentials: true,
  });

  await app.register(require('@fastify/sensible'));

  await app.register(require('@fastify/rate-limit'), {
    max: 1000,
    timeWindow: ms.default('1s'),
  });

  await app.register(require('@fastify/under-pressure'), {
    exposeStatusRoute: '/health',
    exposeUptime: true,
  });

  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Add a simple health check endpoint
  app.getHttpAdapter().get('/', (req, reply) => {
    reply.send({ status: 'healthy' });
  });

  const PORT = process.env.PORT || 3000;
  
  await app.listen(PORT, '0.0.0.0');
  console.log(`🚀 Server running at http://localhost:${PORT}`);
}

bootstrap().catch((error) => {
  console.error('❌ Error during application startup:', error);
  process.exit(1);
});
