import { RegisterDto } from '@/common/dto/auth/Register.dto';
import { LoginDto } from '@/common/dto/auth/Login.dto';
import { UserLoginResponseDto } from '@/common/dto/auth/res/UserLoginResponse.dto';
import { RegisterResponseDto } from '@/common/dto/auth/res/RegisterResponse.dto';
import { RegisterConfirmDto } from '@/common/dto/auth/RegisterConfirm.dto';
import { RegisterResendOtpDto } from '@/common/dto/auth/RegisterResendOtp.dto';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { ChangePasswordDto } from '@/common/dto/auth/ChangePassword.dto';
import { UpdateResult } from 'typeorm';

export const IAuthService = Symbol('IAuthService');
export interface IAuthService {
  resendOtp(dto: RegisterResendOtpDto): Promise<RegisterResponseDto>;

  register(dto: RegisterDto): Promise<RegisterResponseDto>;

  registerUserConfirm(dto: RegisterConfirmDto): Promise<UserLoginResponseDto>;

  loginUser(dto: LoginDto): Promise<UserLoginResponseDto>;

  changePassword(
    userDto: JwtTokenDto,
    dto: ChangePasswordDto,
  ): Promise<UpdateResult>;
}
