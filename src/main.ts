import './instrument';
//
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { globalValidationConfig } from '@/config/validation.config';
import { bootstrapRabbitMQ } from '@/common/bootstrap/rabbitmq.bootstrap';
import { bootstrapSwagger } from '@/common/bootstrap/swagger.bootstrap';

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
    snapshot: true,
  });

  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe(globalValidationConfig));
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1'],
  });

  // RabbitMQ consumer (worker) - runs in the same app as HTTP server
  bootstrapRabbitMQ(app);
  bootstrapSwagger(app);

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);
  console.log(`HTTP server listening on port ${process.env.PORT ?? 3000}`);
}
void bootstrap();
