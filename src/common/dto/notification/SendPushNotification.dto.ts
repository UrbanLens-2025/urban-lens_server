import { NotificationTypes } from '@/common/constants/Notifications.constant';

export class SendPushNotificationDto {
  toUserId: string;
  type: NotificationTypes;
  context: Record<string, any>;
}
