import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '@/modules/auth/services/auth.service';
import { RegisterDto } from '@/common/dto/auth/register.dto';
import { LoginDto } from '@/common/dto/auth/login.dto';
import { RegisterConfirmDto } from '@/common/dto/auth/RegisterConfirm.dto';
import { RegisterResendOtpDto } from '@/common/dto/auth/RegisterResendOtp.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth - Public')
@ApiBearerAuth()
@Controller('/public/auth')
export class AuthPublicController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Create new user' })
  @Post('/register/user')
  register(@Body() createAuthDto: RegisterDto) {
    return this.authService.registerUser(createAuthDto);
  }

  @ApiOperation({
    summary: 'Confirm user registration',
    description: "Use confirmCode from '/register/user' and otpCode from email",
  })
  @Post('/register/confirm')
  registerConfirm(@Body() dto: RegisterConfirmDto) {
    return this.authService.registerUserConfirm(dto);
  }

  @ApiOperation({
    summary: 'Resend OTP code to email (unimplemented)',
  })
  @Post('/register/resend-otp')
  resendOtp(@Body('email') dto: RegisterResendOtpDto) {
    throw new Error('Method not implemented.');
    // return this.authService.resendOtp(dto);
  }

  @ApiOperation({
    summary: 'Login as User',
  })
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.loginUser(loginDto);
  }

  @ApiOperation({ summary: 'Login as Admin' })
  @Post('/login/admin')
  loginAsAdmin(@Body() dto: LoginDto) {
    return this.authService.loginAdmin(dto);
  }
}
