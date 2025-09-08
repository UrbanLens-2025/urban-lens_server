import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { SendEmailDto } from '@/common/dto/notification/SendEmail.dto';
import { EmailSubjects } from '@/common/constants/EmailTemplates.constant';
import { EmailNotificationRepository } from '@/modules/notification/domain/repository/EmailNotification.repository';
import { EmailNotificationEntity } from '@/modules/notification/domain/EmailNotification.entity';

@Injectable()
export class EmailNotificationService {
  private readonly logger = new Logger(EmailNotificationService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly emailNotificationRepository: EmailNotificationRepository,
  ) {}

  async sendEmail(dto: SendEmailDto): Promise<void> {
    let savedEntity: EmailNotificationEntity | null = null;
    if (dto.shouldPersist) {
      savedEntity = await this.emailNotificationRepository.repo.save({
        to: dto.to,
        type: dto.template,
        context: dto.context,
        subject: EmailSubjects[dto.template] || 'No Subject',
      });
    }

    this.logger.log('Sending email with data: ' + JSON.stringify(dto));
    await this.mailerService.sendMail({
      to: dto.to,
      subject: EmailSubjects[dto.template] || 'No Subject',
      template: dto.template,
      context: dto.context,
    });
    this.logger.log('Email sent successfully to ' + dto.to);

    if (dto.shouldPersist && savedEntity) {
      savedEntity.sentAt = new Date();
      savedEntity.hasSent = true;
      await this.emailNotificationRepository.repo.save(savedEntity);
    }
  }
}
