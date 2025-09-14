import { IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterResendOtpDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  confirmCode: string;
}
