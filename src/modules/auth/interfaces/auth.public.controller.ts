import { Body, Controller, Inject, Post } from '@nestjs/common';
import { LoginDto } from '@/common/dto/auth/Login.dto';
import { RegisterConfirmDto } from '@/common/dto/auth/RegisterConfirm.dto';
import { RegisterResendOtpDto } from '@/common/dto/auth/RegisterResendOtp.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegisterUserDto } from '@/common/dto/auth/RegisterUser.dto';
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
  register(@Body() createAuthDto: RegisterUserDto) {
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

  @ApiOperation({ summary: 'Create new business owner' })
  @Post('/register/bowner')
  registerBowner(@Body() createAuthDto: unknown) {
    throw new Error('Method not implemented.');
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

  @ApiOperation({ summary: 'Login as Admin' })
  @Post('/login/admin')
  loginAsAdmin(@Body() dto: LoginDto) {
    return this.authService.loginAdmin(dto);
  }

  @ApiOperation({ summary: 'Login as Business Owner' })
  @Post('/login/bowner')
  loginAsBowner(@Body() dto: LoginDto) {
    throw new Error('Method not implemented.');
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
