import { Body, Controller, Inject, Post } from '@nestjs/common';
import { LoginDto } from '@/common/dto/auth/Login.dto';
import { RegisterConfirmDto } from '@/common/dto/auth/RegisterConfirm.dto';
import { RegisterResendOtpDto } from '@/common/dto/auth/RegisterResendOtp.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegisterDto } from '@/common/dto/auth/Register.dto';
import { IAuthService } from '@/modules/auth/app/IAuth.service';

@ApiTags('Auth - Public')
@ApiBearerAuth()
@Controller('/public/auth')
export class AuthPublicController {
  constructor(
    @Inject(IAuthService) private readonly authService: IAuthService,
  ) {}

  //#region Registration

  @ApiOperation({ summary: 'Create new user' })
  @Post('/register/user')
  register(@Body() createAuthDto: RegisterDto) {
    return this.authService.register(createAuthDto);
  }

  @ApiOperation({
    summary: 'Confirm user registration',
    description: "Use confirmCode from '/register/user' and otpCode from email",
  })
  @Post('/register/confirm')
  registerConfirm(@Body() dto: RegisterConfirmDto) {
    return this.authService.registerUserConfirm(dto);
  }
  //#endregion

  //#region Login
  @ApiOperation({
    summary: 'Login as User',
  })
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.loginUser(loginDto);
  }
  //#endregion

  @ApiOperation({
    summary: 'Resend OTP code to email (unimplemented)',
  })
  @Post('/register/resend-otp')
  resendOtp(@Body('email') dto: RegisterResendOtpDto) {
    throw new Error('Method not implemented.');
    // return this.authService.resendOtp(dto);
  }
}
