import { IsNotEmpty, MaxLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @MaxLength(255)
  currentPassword: string;

  @IsNotEmpty()
  @MaxLength(255)
  newPassword: string;
}
