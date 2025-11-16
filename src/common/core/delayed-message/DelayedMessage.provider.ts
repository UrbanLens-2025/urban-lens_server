import {
  DelayedMessageKeys,
  DelayedMessagePayload,
} from '@/common/constants/DelayedMessageKeys.constant';
import { DelayedMessageResponseWrapper } from '@/common/core/delayed-message/DelayedMessageResponseWrapper';
import { Environment } from '@/config/env.config';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Channel,
  ChannelModel,
  connect,
  Connection,
  ConsumeMessage,
} from 'amqplib';

/**
 * This class does the following:
 * 1) Connects to RabbitMQ
 * 2) Creates a delayed exchange
 * 3) Creates a queue for delayed messages only
 * 4) Binds the queue to the exchange for topic: delayed.#
 */
@Injectable()
export class DelayedMessageProvider implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DelayedMessageProvider.name);

  private channel: Channel | null;
  private connection: ChannelModel | null;

  constructor(
    private readonly configService: ConfigService<Environment>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit() {
    try {
      this.connection = await connect(
        this.configService.getOrThrow<string>('RABBITMQ_URL'),
      );
      this.channel = await this.connection.createChannel();

      // create an exchange to match routing keys
      await this.channel.assertExchange(
        'delayed-exchange',
        'x-delayed-message',
        {
          durable: true,
          arguments: { 'x-delayed-type': 'topic' },
        },
      );

      // create a queue for delayed messages only
      await this.channel.assertQueue('delayed-message-queue', {
        durable: true,
      });

      await this.channel.bindQueue(
        'delayed-message-queue',
        'delayed-exchange',
        'delayed.#', // # means match everything after delayed
      );

      await this.channel.consume(
        'delayed-message-queue',
        (msg) => this.consumeDelayedMessage(msg),
        {
          noAck: false,
        },
      );

      this.logger.log('Delayed message provider initialized successfully');
    } catch (error) {
      this.logger.error('Error initializing delayed message provider', error);
      await this.cleanup();
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.cleanup();
  }

  private async cleanup() {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
    } catch (error) {
      this.logger.error('Error cleaning up delayed message provider', error);
    }
  }

  private consumeDelayedMessage(msg: ConsumeMessage | null) {
    if (!msg) return;

    try {
      const routingKey = msg?.fields.routingKey as DelayedMessageKeys;
      this.eventEmitter.emit(routingKey, this.buildResponseWrapper(msg));
    } catch (error) {
      this.logger.error('Error consuming delayed message', error);
    }
  }

  private buildResponseWrapper(
    msg: ConsumeMessage,
  ): DelayedMessageResponseWrapper<unknown> {
    return new DelayedMessageResponseWrapper(
      () => this.channel?.nack(msg, false, false),
      () => this.channel?.ack(msg),
      JSON.parse(msg.content.toString()),
    );
  }

  public sendDelayedMessage<MessageType extends DelayedMessageKeys>(dto: {
    routingKey: MessageType;
    message: DelayedMessagePayload<MessageType>;
    delayMs: number;
  }): boolean {
    if (!this.channel) {
      throw new InternalServerErrorException(
        'RabbitMQ channel not initialized for delayed messages...',
      );
    }

    const buffer = Buffer.from(JSON.stringify(dto.message));

    const result = this.channel.publish(
      'delayed-exchange',
      dto.routingKey,
      buffer,
      {
        headers: {
          'x-delay': dto.delayMs,
        },
        contentType: 'application/json',
        persistent: true,
      },
    );

    this.logger.verbose(
      `Delayed message published to exchange: ${dto.routingKey}`,
    );
    return result;
  }
}
