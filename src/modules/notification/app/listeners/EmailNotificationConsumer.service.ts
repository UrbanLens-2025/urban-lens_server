import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SendEmailDto } from '@/common/dto/notification/SendEmail.dto';
import { EmailSubjects } from '@/common/constants/EmailTemplates.constant';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
@Processor('email-notifications')
export class EmailNotificationConsumerService extends WorkerHost {
  private readonly logger = new Logger(EmailNotificationConsumerService.name);

  constructor(private readonly mailerService: MailerService) {
    super();
  }

  async process(job: Job, token?: string): Promise<any> {
    switch (job.name) {
      case 'otp-email': {
        await this.sendEmail(job.data as SendEmailDto);
      }
    }
  }

  async sendEmail(dto: SendEmailDto): Promise<void> {
    this.logger.debug(
      `Sending email to ${dto.to} using template ${dto.template}`,
    );
    await this.mailerService.sendMail({
      to: dto.to,
      subject: EmailSubjects[dto.template] || 'No Subject',
      template: dto.template,
      context: dto.context,
    });
  }
}
