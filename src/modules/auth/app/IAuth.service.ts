import { RegisterDto } from '@/common/dto/auth/Register.dto';
import { LoginDto } from '@/common/dto/auth/Login.dto';
import { UserLoginResponse } from '@/common/dto/auth/UserLoginResponse.dto';
import { RegisterResponseDto } from '@/common/dto/auth/RegisterResponse.dto';
import { RegisterConfirmDto } from '@/common/dto/auth/RegisterConfirm.dto';
import { RegisterResendOtpDto } from '@/common/dto/auth/RegisterResendOtp.dto';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { ChangePasswordDto } from '@/common/dto/auth/ChangePassword.dto';
import { UpdateResult } from 'typeorm';

export const IAuthService = Symbol('IAuthService');
export interface IAuthService {
  resendOtp(dto: RegisterResendOtpDto): Promise<any>;

  register(dto: RegisterDto): Promise<RegisterResponseDto>;

  registerUserConfirm(dto: RegisterConfirmDto): Promise<UserLoginResponse.Dto>;

  loginUser(dto: LoginDto): Promise<UserLoginResponse.Dto>;

  loginAdmin(dto: LoginDto): Promise<UserLoginResponse.Dto>;

  changePassword(
    userDto: JwtTokenDto,
    dto: ChangePasswordDto,
  ): Promise<UpdateResult>;
}
