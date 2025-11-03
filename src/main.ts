import './instrument';
//
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { globalValidationConfig } from '@/config/validation.config';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerDocumentConfig } from '@/config/swagger.config';
import { NextFunction, Request, Response } from 'express';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logLevelString = process.env.LOG_LEVELS || 'log';
  const logLevels = logLevelString
    .split(',')
    .map((level) => level.trim()) as Array<
    'log' | 'error' | 'warn' | 'debug' | 'verbose'
  >;

  console.log(`Log levels set to: ${logLevels.join(', ')}`);

  const app = await NestFactory.create(AppModule, {
    logger: logLevels,
  });

  // RabbitMQ consumer (worker) - runs in the same app as HTTP server
  if (process.env.RABBITMQ_URL) {
    console.log('RabbitMQ enabled - configuring publisher and consumer');

    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL],
        queue: process.env.RABBITMQ_QUEUE || 'urban-lens',
        queueOptions: {
          durable: true,
        },
        noAck: false,
        prefetchCount: 50,
      },
    });

    await app.startAllMicroservices();
    console.log('RabbitMQ consumer started');
  } else {
    console.log('RabbitMQ not configured');
  }

  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe(globalValidationConfig));
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1'],
  });

  app.use(
    ['/swagger', '/swagger/json'],
    (_: Request, res: Response, next: NextFunction) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      next();
    },
  );

  SwaggerModule.setup(
    'swagger',
    app,
    SwaggerModule.createDocument(app, swaggerDocumentConfig),
    {
      jsonDocumentUrl: 'swagger/json',
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
        docExpansion: 'none',
        url: '/swagger/json?v=' + Date.now(),
        cacheControl: false,
      },
      customJs: '/swagger-custom.js',
    },
  );

  await app.listen(process.env.PORT ?? 3000);
  console.log(`HTTP server listening on port ${process.env.PORT ?? 3000}`);
}
void bootstrap();
