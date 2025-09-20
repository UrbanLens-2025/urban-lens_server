import { IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({ default: 'password' })
  currentPassword: string;

  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({ default: 'password1' })
  newPassword: string;
}
