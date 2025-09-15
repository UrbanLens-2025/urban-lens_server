import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RegisterDeviceDto {
  @ApiProperty({
    name: 'token',
    description: 'Token received from firebase FCM',
  })
  @IsNotEmpty()
  token: string;
}
