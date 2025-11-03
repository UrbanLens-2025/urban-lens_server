import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { EmailWorkerService } from '@/workers/EmailWorker.service';

interface EmailMessage {
  to: string;
  template: string;
  context: Record<string, any>;
}

@Controller()
export class EmailWorkerController {
  private readonly logger = new Logger(EmailWorkerController.name);

  constructor(private readonly emailWorkerService: EmailWorkerService) {}

  @EventPattern('email.send')
  async handleSendEmail(
    @Payload() data: EmailMessage,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      this.logger.debug(
        `Received email.send message for: ${data.to}, template: ${data.template}`,
      );

      await this.emailWorkerService.sendEmail(
        data.to,
        data.template,
        data.context,
      );

      this.logger.log(`Email sent successfully to: ${data.to}`);
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${data.to}: ${error.message}`,
        error.stack,
      );
      // Acknowledge anyway to prevent requeue loop, or use nack with requeue based on your policy
      channel.ack(originalMsg);
    }
  }
}
