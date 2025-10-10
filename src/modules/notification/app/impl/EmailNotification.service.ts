import { Injectable, Logger } from '@nestjs/common';
import { SendEmailDto } from '@/common/dto/notification/SendEmail.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { IEmailNotificationService } from '@/modules/notification/app/IEmailNotification.service';
import { CoreService } from '@/common/core/Core.service';

@Injectable()
export class EmailNotificationService
  extends CoreService
  implements IEmailNotificationService
{
  private readonly logger = new Logger(EmailNotificationService.name);

  constructor(
    @InjectQueue('email-notifications') private readonly emailQueue: Queue,
  ) {
    super();
  }

  async sendEmail(dto: SendEmailDto): Promise<void> {
    const res = await this.emailQueue.add('otp-email', dto, {
      removeOnComplete: true,
      removeOnFail: { age: 60 * 30 },
    });
    this.logger.debug(`Email job added to queue with ID: ${res.id}`);
  }
}
