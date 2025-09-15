import { Controller, Get, Post } from '@nestjs/common';
import { EmailNotificationService } from '@/modules/notification/service/EmailNotification.service';
import { EmailTemplates } from '@/common/constants/EmailTemplates.constant';
import * as firebase from 'firebase-admin';

@Controller('notification')
export class TestController {
  constructor(private readonly emailService: EmailNotificationService) {}

  @Get('add-queue')
  async testQueue() {
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

  @Post('notify-webpush')
  async testWebPush() {
    try {
      await firebase.messaging().send({
        token:
          'fuhAfo66mIrGrcwAz1aKht:APA91bFJKjH_XAeqFw0TFso5CwsqwGXledh2SeuFX-Q6ZQgpGEIIqthut-lQ_qxYaYD2Zce81QeXqUJVAP9UXVRiDT7K5_zH3LIKIjqHL8v5R7SzpPUTJoc',
        webpush: {
          notification: {
            title: 'Hello',
            body: 'This is a web push notification',
          },
        },
      });
    } catch (e) {
      console.log(e);
    }
  }
}
