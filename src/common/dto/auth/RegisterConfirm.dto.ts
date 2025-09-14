import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterConfirmDto {
  @IsNotEmpty()
  @ApiProperty()
  confirmCode: string;

  @IsNotEmpty()
  @ApiProperty()
  otpCode: string;

  @IsNotEmpty()
  @ApiProperty()
  email: string;
}
