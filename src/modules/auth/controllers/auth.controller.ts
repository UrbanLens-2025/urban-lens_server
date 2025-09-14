import { Controller, Post, Body, Put } from '@nestjs/common';
import { AuthService } from '@/modules/auth/services/auth.service';
import { RegisterDto } from '@/common/dto/auth/register.dto';
import { LoginDto } from '@/common/dto/auth/login.dto';
import { RegisterConfirmDto } from '@/common/dto/auth/RegisterConfirm.dto';
import { RegisterResendOtpDto } from '@/common/dto/auth/RegisterResendOtp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register/user')
  register(@Body() createAuthDto: RegisterDto) {
    return this.authService.register(createAuthDto);
  }

  @Post('/register/confirm')
  registerConfirm(@Body() dto: RegisterConfirmDto) {
    return this.authService.registerConfirm(dto);
  }

  @Post('/register/resend-otp')
  resendOtp(@Body('email') dto: RegisterResendOtpDto) {
    throw new Error('Method not implemented.');
    // return this.authService.resendOtp(dto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Put('/change-password')
  changePassword() {}
}
