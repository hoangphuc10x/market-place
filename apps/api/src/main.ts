import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  const logger = new Logger('Bootstrap');

  // REST surface lives under /v1 — static /uploads/* paths bypass it
  // automatically because they're served by Express middleware, not by
  // Nest controllers (controller POST is at /v1/uploads).
  app.setGlobalPrefix('v1');

  app.enableCors({
    origin: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(new AllExceptionsFilter());

  // Static uploads dir (dev only; swap for R2/S3 in prod).
  const uploadDir = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  app.useStaticAssets(uploadDir, { prefix: '/uploads/' });

  const port = Number(process.env.PORT ?? process.env.API_PORT ?? 4000);
  await app.listen(port);
  logger.log(`API listening on http://localhost:${port}/v1`);
  logger.log(`Uploads served at http://localhost:${port}/uploads/`);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to bootstrap API:', err);
  process.exit(1);
});
