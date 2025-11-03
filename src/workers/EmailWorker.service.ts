import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailSubjects } from '@/common/constants/EmailTemplates.constant';

@Injectable()
export class EmailWorkerService {
  private readonly logger = new Logger(EmailWorkerService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(
    to: string,
    template: string,
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
      this.logger.error(
        `Failed to send email to ${to}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
