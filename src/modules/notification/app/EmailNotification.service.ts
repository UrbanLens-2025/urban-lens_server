import { Injectable, Logger } from '@nestjs/common';
import { SendEmailDto } from '@/common/dto/notification/SendEmail.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class EmailNotificationService {
  private readonly logger = new Logger(EmailNotificationService.name);

  constructor(
    @InjectQueue('email-notifications') private readonly emailQueue: Queue,
  ) {}

  async sendEmail(dto: SendEmailDto): Promise<void> {
    const res = await this.emailQueue.add('otp-email', dto, {});
    this.logger.debug(`Email job added to queue with ID: ${res.id}`);
  }
}
