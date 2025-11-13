import {
  ClientProvider,
  ClientsModuleOptions,
  ClientsModuleOptionsFactory,
  Transport,
} from '@nestjs/microservices';
import { Environment } from '@/config/env.config';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

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

@Injectable()
export class RabbitMQBaseClientConfig implements ClientsModuleOptionsFactory {
  public static readonly SERVICE_NAME = 'RABBITMQ_CLIENT';

  constructor(private readonly configService: ConfigService<Environment>) {}

  createClientOptions(): Promise<ClientProvider> | ClientProvider {
    return {
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.getOrThrow<string>('RABBITMQ_URL')],
        queue: this.configService.getOrThrow<string>('RABBITMQ_QUEUE'),
        queueOptions: {
          durable: true,
        },
        persistent: true,
      },
    };
  }
}
