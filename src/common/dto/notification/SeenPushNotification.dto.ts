import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class SeenPushNotificationDto {
  @ApiProperty({
    name: 'notificationId',
    description: 'ids of notifications as array',
  })
  @IsArray()
  notificationId: number[];
}
