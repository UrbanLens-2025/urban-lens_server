import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';

class Notification {
  @ApiProperty()
  title?: string;
  @ApiProperty()
  body?: string;
  @ApiProperty()
  imageUrl?: string;
}

export class SendRawPushNotificationDto {
  @ApiProperty()
  @IsNotEmpty()
  toUserId: string;

  @ApiProperty()
  @IsNotEmptyObject()
  payload: Notification;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  sendAfterSeconds?: number = 0;
}
