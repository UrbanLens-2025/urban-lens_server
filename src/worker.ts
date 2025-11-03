import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { WorkerModule } from './worker.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Worker');

  const rabbitMQUrl = process.env.RABBITMQ_URL;
  const rabbitMQQueue = process.env.RABBITMQ_QUEUE || 'urban-lens';

  if (!rabbitMQUrl) {
    logger.error('RABBITMQ_URL not configured. Worker cannot start.');
    process.exit(1);
  }

  logger.log(`Starting RabbitMQ Worker...`);
  logger.log(`Queue: ${rabbitMQQueue}`);
  logger.log(`URL: ${rabbitMQUrl}`);
  logger.log(`Batch processing enabled: 10 messages/user or 5s timeout`);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    WorkerModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [rabbitMQUrl],
        queue: rabbitMQQueue,
        queueOptions: {
          durable: true,
        },
        noAck: false,
        prefetchCount: 50, // Fetch 50 messages at a time for batching
      },
    },
  );

  await app.listen();
  logger.log('RabbitMQ Worker is listening for messages...');
}

bootstrap();
