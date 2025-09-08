import { Controller, Get } from '@nestjs/common';
import { EmailNotificationService } from '@/modules/notification/service/EmailNotification.service';
import { EmailTemplates } from '@/common/constants/EmailTemplates.constant';

@Controller('notification')
export class TestController {
  constructor(private readonly emailService: EmailNotificationService) {}

  @Get('test')
  async test() {
    await this.emailService.sendEmail({
      to: 'wizardap.dev@gmail.com',
      template: EmailTemplates.CONFIRM_OTP,
      shouldPersist: true,
      context: {
        name: 'Jimmy',
        otp: '123345',
      },
    });
  }
}
