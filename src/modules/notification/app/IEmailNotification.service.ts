// email-notification.service.interface.ts
import { SendEmailDto } from '@/common/dto/notification/SendEmail.dto';

export const IEmailNotificationService = Symbol('IEmailNotificationService');
export interface IEmailNotificationService {
  sendEmail(dto: SendEmailDto): void;
}
