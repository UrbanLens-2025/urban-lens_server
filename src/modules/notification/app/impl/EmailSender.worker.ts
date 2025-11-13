import {
  EmailSubjects,
  EmailTemplates,
} from '@/common/constants/EmailTemplates.constant';
import { CoreService } from '@/common/core/Core.service';
import { IEmailSenderWorker } from '@/modules/notification/app/IEmailSender.worker';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailSenderWorker
  extends CoreService
  implements IEmailSenderWorker
{
  private readonly logger = new Logger(EmailSenderWorker.name);

  constructor(private readonly mailerService: MailerService) {
    super();
  }

  async sendEmail(
    to: string,
    template: EmailTemplates,
    context: Record<string, any>,
  ): Promise<void> {
    try {
      this.logger.debug(`Sending email to ${to} using template ${template}`);

      await this.mailerService.sendMail({
        to,
        subject: EmailSubjects[template] || 'No Subject',
        template,
        context,
      });

      this.logger.debug(`Email sent successfully to ${to}`);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to send email to ${to}: ${error.message}`,
          error.stack,
        );
      }
      throw error;
    }
  }
}
