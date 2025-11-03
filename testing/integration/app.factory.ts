import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@/app.module';
import { NextFunction, Request, Response } from 'express';

export async function createTestingApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  // Mirror production routing setup
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: ['1'] });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Basic request logging for integration tests
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`[TEST] ${req.method} ${req.originalUrl}`, req.body);
    next();
  });

  await app.init();
  return app;
}
