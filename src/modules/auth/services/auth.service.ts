import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { RegisterDto } from '@/common/dto/auth/register.dto';
import { TokenService } from '../../helper/token/token.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '@/common/dto/auth/login.dto';
import { UserRepository } from '@/modules/auth/infra/repository/User.repository';
import { UserResponseDto } from '@/common/dto/auth/UserResponse.dto';
import { CoreService } from '@/common/core/Core.service';
import { RegisterResponseDto } from '@/common/dto/auth/RegisterResponse.dto';
import { randomUUID } from 'crypto';
import { RegisterConfirmDto } from '@/common/dto/auth/RegisterConfirm.dto';
import { EmailNotificationService } from '@/modules/notification/service/EmailNotification.service';
import { EmailTemplates } from '@/common/constants/EmailTemplates.constant';
import { RedisRegisterConfirmRepository } from '@/modules/auth/infra/repository/RedisRegisterConfirm.repository';
import { RegisterResendOtpDto } from '@/common/dto/auth/RegisterResendOtp.dto';
import { UserEntity } from '@/modules/auth/domain/User.entity';

@Injectable()
export class AuthService extends CoreService {
  constructor(
    private readonly redisRegisterConfirmRepository: RedisRegisterConfirmRepository,
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly emailNotificationService: EmailNotificationService,
  ) {
    super();
  }

  private readonly LOGGER = new Logger(AuthService.name);

  async register(createAuthDto: RegisterDto): Promise<RegisterResponseDto> {
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

  async registerConfirm(dto: RegisterConfirmDto): Promise<UserResponseDto> {
    const createAuthDto =
      await this.redisRegisterConfirmRepository.getAndValidate(
        dto.email,
        dto.confirmCode,
        dto.otpCode,
      );

    if (!createAuthDto) {
      throw new BadRequestException('Invalid confirm code, otp code, or email');
    }

    const userEntity = this.mapTo_Raw(UserEntity, createAuthDto);
    userEntity.password = await bcrypt.hash(createAuthDto.password, 10);
    const user = await this.userRepository.repo.save(userEntity);

    const response = this.mapTo(UserResponseDto, user);
    response.token = await this.tokenService.generateToken(user);
    return response;
  }

  async login(loginDto: LoginDto): Promise<UserResponseDto> {
    const user = await this.userRepository.repo.findOneBy({
      email: loginDto.email,
    });

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

    const response = this.mapTo(UserResponseDto, user);

    response.token = await this.tokenService.generateToken(user);
    return response;
  }

  resendOtp(_: RegisterResendOtpDto) {
    return null;
  }
}
