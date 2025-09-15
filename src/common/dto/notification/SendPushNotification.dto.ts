import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNotEmptyObject } from 'class-validator';
import type { Notification } from 'firebase-admin/messaging';

export class SendPushNotificationDto {
  @ApiProperty()
  @IsNotEmpty()
  toUserId: string;

  @ApiProperty()
  @IsNotEmptyObject()
  payload: Notification;
}
