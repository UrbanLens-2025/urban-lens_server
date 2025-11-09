import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { INestApplication } from '@nestjs/common';

export function bootstrapRabbitMQ(app: INestApplication) {
  console.debug('Bootstrapping RabbitMQ microservice...');

  const rabbitMQUrl = process.env.RABBITMQ_URL;
  const rabbitMQQueue = process.env.RABBITMQ_QUEUE || 'urban-lens';

  if (!rabbitMQUrl) {
    console.warn('- RabbitMQ URL not provided. Skipping RabbitMQ setup.');
    return;
  }

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitMQUrl],
      queue: rabbitMQQueue,
      queueOptions: {
        durable: true,
      },
      noAck: false,
      prefetchCount: 50,
      persistent: true,
    },
  });

  console.log(
    '- RabbitMQ configured with URL:',
    rabbitMQUrl,
    'and Queue:',
    rabbitMQQueue,
  );
}
