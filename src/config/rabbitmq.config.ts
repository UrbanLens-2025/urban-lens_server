import { ClientsModuleOptions, Transport } from '@nestjs/microservices';

export const getRabbitMQConfig = (): ClientsModuleOptions => {
  if (!process.env.RABBITMQ_URL) {
    return [];
  }

  return [
    {
      name: 'RABBITMQ_CLIENT',
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL],
        queue: process.env.RABBITMQ_QUEUE || 'urban-lens',
        queueOptions: {
          durable: true,
        },
        persistent: true,
      },
    },
  ];
};
