import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { SendEmailDto } from '@/common/dto/notification/SendEmail.dto';
import { IEmailNotificationService } from '@/modules/notification/app/IEmailNotification.service';
import { CoreService } from '@/common/core/Core.service';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class EmailNotificationService
  extends CoreService
  implements IEmailNotificationService
{
  private readonly logger = new Logger(EmailNotificationService.name);

  constructor(
    @Optional()
    @Inject('RABBITMQ_CLIENT')
    private readonly rabbitMQClient: ClientProxy | null,
  ) {
    super();
  }

  sendEmail(dto: SendEmailDto): void {
    if (!this.rabbitMQClient) {
      this.logger.warn('RabbitMQ client not available, skipping email send');
      return;
    }

    try {
      this.rabbitMQClient.emit('email.send', {
        to: dto.to,
        template: dto.template,
        context: dto.context,
      });
      this.logger.debug(`Email message published to RabbitMQ: ${dto.to}`);
    } catch (error) {
      this.logger.error(`Failed to publish email message: ${error}`);
      throw error;
    }
  }
}
