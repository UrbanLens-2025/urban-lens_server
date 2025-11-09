import { SendEmailDto } from '@/common/dto/notification/SendEmail.dto';
import { IEmailSenderWorker } from '@/modules/notification/app/IEmailSender.worker';
import { Controller, Inject, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import * as amqp from 'amqplib';

@Controller()
export class EmailConsumer {
  private readonly logger = new Logger(EmailConsumer.name);

  constructor(
    @Inject(IEmailSenderWorker)
    private readonly emailSenderWorker: IEmailSenderWorker,
  ) {}

  @EventPattern('email.send')
  async handleSendEmail(
    @Payload() data: SendEmailDto,
    @Ctx() context: RmqContext,
  ) {
    const channel: amqp.Channel = context.getChannelRef() as amqp.Channel;
    const originalMsg: amqp.ConsumeMessage =
      context.getMessage() as amqp.ConsumeMessage;

    try {
      this.logger.debug(
        `Received email.send message for ${data.to} and template ${data.template}`,
      );

      await this.emailSenderWorker.sendEmail(
        data.to,
        data.template,
        data.context,
      );

      channel.ack(originalMsg);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Error processing email.send message for ${data.to}: ${error.message}`,
          error.stack,
        );

        channel.nack(originalMsg, false, false); // Discard the message
      }
    }
  }
}
