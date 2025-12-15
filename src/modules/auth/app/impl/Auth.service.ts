import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from '@/common/dto/auth/Register.dto';
import { TokenService } from '@/common/core/token/token.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '@/common/dto/auth/Login.dto';
import { AccountRepository } from '@/modules/account/infra/repository/Account.repository';
import { UserLoginResponseDto } from '@/common/dto/auth/res/UserLoginResponse.dto';
import { CoreService } from '@/common/core/Core.service';
import { ExistsByEmailResponseDto } from '@/common/dto/auth/res/ExistsByEmailResponse.dto';
import { ExistsByEmailDto } from '@/common/dto/auth/ExistsByEmail.dto';
import { RegisterResponseDto } from '@/common/dto/auth/res/RegisterResponse.dto';
import { randomUUID } from 'crypto';
import { RegisterConfirmDto } from '@/common/dto/auth/RegisterConfirm.dto';
import { EmailTemplates } from '@/common/constants/EmailTemplates.constant';
import { RedisRegisterConfirmRepository } from '@/modules/auth/infra/repository/RedisRegisterConfirm.repository';
import { RegisterResendOtpDto } from '@/common/dto/auth/RegisterResendOtp.dto';
import { AccountEntity } from '@/modules/account/domain/Account.entity';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { ChangePasswordDto } from '@/common/dto/auth/ChangePassword.dto';
import { Role } from '@/common/constants/Role.constant';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';
import { IAuthService } from '@/modules/auth/app/IAuth.service';
import { IEmailNotificationService } from '@/modules/notification/app/IEmailNotification.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  USER_REGISTRATION_CONFIRMED,
  UserRegistrationConfirmedEvent,
} from '@/modules/auth/app/events/UserRegistrationConfirmed.event';
import { IWalletActionService } from '@/modules/wallet/app/IWalletAction.service';
import { AccountSuspensionRepository } from '@/modules/account/infra/repository/AccountSuspension.repository';

@Injectable()
export class AuthService extends CoreService implements IAuthService {
  private readonly LOGGER = new Logger(AuthService.name);

  constructor(
    private readonly redisRegisterConfirmRepository: RedisRegisterConfirmRepository,
    private readonly accountRepository: AccountRepository,
    private readonly tokenService: TokenService,
    @Inject(IEmailNotificationService)
    private readonly emailNotificationService: IEmailNotificationService,
    @Inject(IWalletActionService)
    private readonly walletActionService: IWalletActionService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  async existsByEmail(
    dto: ExistsByEmailDto,
  ): Promise<ExistsByEmailResponseDto> {
    const exists = await this.accountRepository.repo.existsBy({
      email: dto.email,
    });
    const response = new ExistsByEmailResponseDto();
    response.exists = exists;
    return response;
  }

  async resendOtp(dto: RegisterResendOtpDto): Promise<RegisterResponseDto> {
    const existingRegistration =
      await this.redisRegisterConfirmRepository.getByEmail(dto.email);

    if (!existingRegistration) {
      throw new BadRequestException('No pending registration found');
    }

    if (existingRegistration.confirmCode !== dto.confirmCode) {
      throw new BadRequestException('Invalid confirm code');
    }

    const userExistsDb = await this.accountRepository.repo.existsBy({
      email: dto.email,
    });

    if (userExistsDb) {
      throw new BadRequestException('User already exists');
    }

    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    this.LOGGER.debug(`Resending OTP code: ${otpCode} for email: ${dto.email}`);

    await this.emailNotificationService.sendEmail({
      to: dto.email,
      template: EmailTemplates.CONFIRM_OTP,
      context: {
        name: existingRegistration.firstName,
        otp: otpCode,
        expiresInMinutes: RedisRegisterConfirmRepository.getExpirationS() / 60,
      },
    });

    try {
      await this.redisRegisterConfirmRepository.set(
        existingRegistration,
        existingRegistration.confirmCode,
        otpCode,
      );
    } catch (error) {
      throw new InternalServerErrorException("Couldn't update OTP in redis.");
    }

    const response = new RegisterResponseDto();
    response.confirmCode = existingRegistration.confirmCode;

    return response;
  }

  async register(createAuthDto: RegisterDto): Promise<RegisterResponseDto> {
    if (createAuthDto.role === Role.ADMIN) {
      throw new BadRequestException('Cannot register as admin');
    }

    const userExistsDb = await this.accountRepository.repo.existsBy({
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
  ): Promise<UserLoginResponseDto> {
    // Validate without deleting - we'll delete only after transaction succeeds
    const registrationData =
      await this.redisRegisterConfirmRepository.getByEmail(dto.email);

    if (!registrationData) {
      throw new BadRequestException('Invalid confirm code, otp code, or email');
    }

    if (
      registrationData.confirmCode !== dto.confirmCode ||
      registrationData.otpCode !== dto.otpCode
    ) {
      throw new BadRequestException('Invalid confirm code, otp code, or email');
    }

    const userEntity = this.mapTo_Raw(AccountEntity, registrationData);
    userEntity.password = await bcrypt.hash(registrationData.password, 10);

    return (
      this.ensureTransaction(null, async (em) => {
        return this.accountRepository.repo
          .save(userEntity)
          .then(async (res) => {
            await this.walletActionService.createDefaultWallet({
              userId: res.id,
              entityManager: em,
            });
            return res;
          });
      })
        // delete Redis entry only after transaction succeeds
        .then(async (res) => {
          await this.redisRegisterConfirmRepository.delete(dto.email);
          return res;
        })
        // send welcome email
        .then(async (res) => {
          await this.emailNotificationService.sendEmail({
            to: res.email,
            template: EmailTemplates.WELCOME,
            context: {
              user_name: res.firstName + ' ' + res.lastName,
            },
          });
          return res;
        })
        // emit events
        .then((res) => {
          this.eventEmitter.emit(
            USER_REGISTRATION_CONFIRMED,
            new UserRegistrationConfirmedEvent(res),
          );
          return res;
        })
        // generate response
        .then(async (res) => {
          const response = new UserLoginResponseDto();
          response.user = this.mapTo(AccountResponseDto, res);
          response.token = await this.tokenService.generateToken(res);
          return response;
        })
    );
  }

  async loginUser(loginDto: LoginDto): Promise<UserLoginResponseDto> {
    const user = await this.accountRepository.repo.findOneBy({
      email: loginDto.email,
    });

    return this.validateLogin(loginDto, user);
  }

  async changePassword(userDto: JwtTokenDto, dto: ChangePasswordDto) {
    const user = await this.accountRepository.repo.findOneBy({
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

    return this.accountRepository.repo.update({ id: user.id }, user);
  }

  private async validateLogin(
    loginDto: LoginDto,
    user: AccountEntity | null,
  ): Promise<UserLoginResponseDto> {
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const activeSuspension = await this.ensureTransaction(null, async (em) => {
      const accountSuspensionRepo = AccountSuspensionRepository(em);
      return accountSuspensionRepo.getActiveSuspension({
        accountId: user.id,
      });
    });

    if (activeSuspension) {
      throw new UnauthorizedException(
        `Account is suspended until ${activeSuspension.suspendedUntil.toLocaleDateString('vi-VN')} for reason: ${activeSuspension.suspensionReason}`,
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    const response = new UserLoginResponseDto();
    response.user = this.mapTo(AccountResponseDto, user);
    response.token = await this.tokenService.generateToken(user);
    return response;
  }
}
