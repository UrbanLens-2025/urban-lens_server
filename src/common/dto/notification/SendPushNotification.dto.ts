import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNotEmptyObject } from 'class-validator';

class Notification {
  @ApiProperty()
  title?: string;
  @ApiProperty()
  body?: string;
  @ApiProperty()
  imageUrl?: string;
}

export class SendPushNotificationDto {
  @ApiProperty()
  @IsNotEmpty()
  toUserId: string;

  @ApiProperty()
  @IsNotEmptyObject()
  payload: Notification;
}
