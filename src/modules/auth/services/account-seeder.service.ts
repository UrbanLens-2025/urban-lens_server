import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { UserRepository } from '@/modules/auth/infra/repository/User.repository';
import { Role } from '@/common/constants/Role.constant';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Environment } from '@/config/env.config';

@Injectable()
export class AccountSeederService implements OnModuleInit {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService<Environment>,
  ) {}

  private readonly LOGGER = new Logger(AccountSeederService.name);
  public readonly DEFAULT_USER_DETAILS = {
    email: 'danganhsang2003@gmail.com',
    password: '123456',
    firstName: 'John',
    lastName: 'User',
    isVerified: true,
    phoneNumber: '+84123456789',
    role: Role.USER,
  };

  async onModuleInit() {
    if (!this.configService.get('ENABLE_ACCOUNT_SEEDING')) {
      // skip seeding
      return;
    }

    this.LOGGER.debug("Seeding default user if it doesn't exist...");
    const exists = await this.userRepository.repo.existsBy({
      email: this.DEFAULT_USER_DETAILS.email,
    });
    if (exists) {
      this.LOGGER.debug('Default user already exists. Skipping seeding.');
      return;
    }
    try {
      const user = await this.userRepository.repo.save({
        ...this.DEFAULT_USER_DETAILS,
        password: bcrypt.hashSync(this.DEFAULT_USER_DETAILS.password, 10),
      });
      this.LOGGER.debug(`Default user created: ${JSON.stringify(user)}`);
    } catch (error) {
      this.LOGGER.error('Error creating default user:', error);
    }
  }
}
