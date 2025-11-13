import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { SendEmailDto } from '@/common/dto/notification/SendEmail.dto';
import { IEmailNotificationService } from '@/modules/notification/app/IEmailNotification.service';
import { CoreService } from '@/common/core/Core.service';
import { ClientProxy } from '@nestjs/microservices';
import { RabbitMQBaseClientConfig } from '@/config/rabbitmq.config';

@Injectable()
export class EmailNotificationService
  extends CoreService
  implements IEmailNotificationService
{
  private readonly logger = new Logger(EmailNotificationService.name);

  constructor(
    @Optional()
    @Inject(RabbitMQBaseClientConfig.SERVICE_NAME)
    private readonly rabbitMQClient: ClientProxy | null,
  ) {
    super();
  }

  sendEmail(dto: SendEmailDto): Promise<void> {
    if (!this.rabbitMQClient) {
      this.logger.warn('RabbitMQ client not available, skipping email send');
      return Promise.resolve();
    }

    try {
      this.rabbitMQClient.emit('email.send', dto);
      this.logger.debug(`Email message published to RabbitMQ: ${dto.to}`);

      return Promise.resolve();
    } catch (error) {
      this.logger.error(`Failed to publish email message: ${error}`);
      throw error;
    }
  }
}
