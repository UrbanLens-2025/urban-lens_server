import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { RegisterUserDto } from '@/common/dto/auth/RegisterUser.dto';
import { TokenService } from '@/common/core/token/token.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '@/common/dto/auth/Login.dto';
import { AccountRepository } from '@/modules/auth/infra/repository/Account.repository';
import { UserLoginResponse } from '@/common/dto/auth/UserLoginResponse.dto';
import { CoreService } from '@/common/core/Core.service';
import { RegisterResponseDto } from '@/common/dto/auth/RegisterResponse.dto';
import { randomUUID } from 'crypto';
import { RegisterConfirmDto } from '@/common/dto/auth/RegisterConfirm.dto';
import { EmailNotificationService } from '@/modules/notification/app/EmailNotification.service';
import { EmailTemplates } from '@/common/constants/EmailTemplates.constant';
import { RedisRegisterConfirmRepository } from '@/modules/auth/infra/repository/RedisRegisterConfirm.repository';
import { RegisterResendOtpDto } from '@/common/dto/auth/RegisterResendOtp.dto';
import { AccountEntity } from '@/modules/auth/domain/Account.entity';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { ChangePasswordDto } from '@/common/dto/auth/ChangePassword.dto';
import { Role } from '@/common/constants/Role.constant';
import { UserAccountResponse } from '@/common/dto/auth/UserAccountResponse.dto';

@Injectable()
export class AuthService extends CoreService {
  private readonly LOGGER = new Logger(AuthService.name);

  constructor(
    private readonly redisRegisterConfirmRepository: RedisRegisterConfirmRepository,
    private readonly userRepository: AccountRepository,
    private readonly tokenService: TokenService,
    private readonly emailNotificationService: EmailNotificationService,
  ) {
    super();
  }

  resendOtp(_: RegisterResendOtpDto): Promise<any> {
    throw new Error('Method not implemented.');
  }

  async registerUser(
    createAuthDto: RegisterUserDto,
  ): Promise<RegisterResponseDto> {
    const userExistsDb = await this.userRepository.repo.existsBy({
      email: createAuthDto.email,
    });

    if (userExistsDb) {
      throw new BadRequestException('User already exists');
    }

    const confirmCode = randomUUID();
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    this.LOGGER.debug(
      `Generated OTP code: ${otpCode} for email: ${createAuthDto.email}`,
    );

    await this.emailNotificationService.sendEmail({
      to: createAuthDto.email,
      template: EmailTemplates.CONFIRM_OTP,
      context: {
        name: createAuthDto.firstName,
        otp: otpCode,
        expiresInMinutes: RedisRegisterConfirmRepository.getExpirationS() / 60,
      },
    });

    try {
      await this.redisRegisterConfirmRepository.set(
        createAuthDto,
        confirmCode,
        otpCode,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        "Couldn't save confirm code in redis.",
      );
    }
    const response = new RegisterResponseDto();
    response.confirmCode = confirmCode;

    return response;
  }

  async registerUserConfirm(
    dto: RegisterConfirmDto,
  ): Promise<UserLoginResponse.Dto> {
    const createAuthDto =
      await this.redisRegisterConfirmRepository.getAndValidate(
        dto.email,
        dto.confirmCode,
        dto.otpCode,
      );

    if (!createAuthDto) {
      throw new BadRequestException('Invalid confirm code, otp code, or email');
    }

    const userEntity = this.mapTo_Raw(AccountEntity, createAuthDto);
    userEntity.password = await bcrypt.hash(createAuthDto.password, 10);
    userEntity.role = Role.USER;
    const user = await this.userRepository.repo.save(userEntity);

    await this.emailNotificationService.sendEmail({
      to: user.email,
      template: EmailTemplates.WELCOME,
      context: {
        user_name: user.firstName + ' ' + user.lastName,
      },
    });

    const response = new UserLoginResponse.Dto();
    response.user = this.mapTo(UserAccountResponse.Dto, user);
    response.token = await this.tokenService.generateToken(user);
    return response;
  }

  async loginUser(loginDto: LoginDto): Promise<UserLoginResponse.Dto> {
    const user = await this.userRepository.repo.findOneBy({
      email: loginDto.email,
      role: Role.USER,
    });

    return this.validateLogin(loginDto, user);
  }

  async loginAdmin(loginDto: LoginDto): Promise<UserLoginResponse.Dto> {
    const user = await this.userRepository.repo.findOneBy({
      email: loginDto.email,
      role: Role.ADMIN,
    });

    return this.validateLogin(loginDto, user);
  }

  async changePassword(userDto: JwtTokenDto, dto: ChangePasswordDto) {
    const user = await this.userRepository.repo.findOneBy({
      id: userDto.sub,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);

    return this.userRepository.repo.update({ id: user.id }, user);
  }

  private async validateLogin(
    loginDto: LoginDto,
    user: AccountEntity | null,
  ): Promise<UserLoginResponse.Dto> {
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    const response = new UserLoginResponse.Dto();
    response.user = this.mapTo(UserAccountResponse.Dto, user);
    response.token = await this.tokenService.generateToken(user);
    return response;
  }
}
