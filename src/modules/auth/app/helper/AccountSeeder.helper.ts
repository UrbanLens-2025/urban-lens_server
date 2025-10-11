import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AccountRepository } from '@/modules/auth/infra/repository/Account.repository';
import { Role } from '@/common/constants/Role.constant';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Environment } from '@/config/env.config';
import { In } from 'typeorm';

@Injectable()
export class AccountSeederHelper implements OnModuleInit {
  constructor(
    private readonly userRepository: AccountRepository,
    private readonly configService: ConfigService<Environment>,
  ) {}

  private readonly LOGGER = new Logger(AccountSeederHelper.name);
  public readonly DEFAULT_USER_DETAILS = {
    email: 'danganhsang2003@gmail.com',
    password: '123456',
    firstName: 'John',
    lastName: 'User',
    isVerified: true,
    phoneNumber: '+84123456789',
    role: Role.USER,
  };

  public readonly DEFAULT_USERS = [
    {
      email: 'danganhsang2003@gmail.com',
      password: '123456',
      firstName: 'John',
      lastName: 'User',
      isVerified: true,
      phoneNumber: '+84123456789',
      role: Role.USER,
    },
    {
      email: 'urbanlens.main@gmail.com',
      password: '123456',
      firstName: 'Jimmy',
      lastName: 'admin',
      isVerified: true,
      phoneNumber: '+84123456789',
      role: Role.ADMIN,
    },
    {
      email: 'business@gmail.com',
      password: '12345678',
      firstName: 'Business',
      lastName: 'Owner',
      isVerified: true,
      phoneNumber: '+84123456789',
      role: Role.BUSINESS_OWNER,
    },
    {
      email: 'eventcreator@gmail.com',
      password: '12345678',
      firstName: 'Event',
      lastName: 'Creator',
      isVerified: true,
      phoneNumber: '+84123456789',
      role: Role.EVENT_CREATOR,
    },
  ];

  async onModuleInit() {
    if (!this.configService.get('ENABLE_ACCOUNT_SEEDING')) {
      // skip seeding
      return;
    }

    this.LOGGER.debug("Seeding default user if it doesn't exist...");
    const exists = await this.userRepository.repo.find({
      where: { email: In(this.DEFAULT_USERS.map((user) => user.email)) },
      select: { email: true },
    });
    if (exists.length === this.DEFAULT_USERS.length) {
      this.LOGGER.debug('Default user already exists. Skipping seeding.');
      return;
    }

    // filter out users that already exist
    const usersToCreate = this.DEFAULT_USERS.filter((user) => {
      return !exists.some((defaultUser) => user.email === defaultUser.email);
    }).map((user) => {
      user.password = bcrypt.hashSync(user.password, 10);
      return user;
    });

    try {
      const user = await this.userRepository.repo.save(usersToCreate);
      this.LOGGER.debug(`Default user created: ${JSON.stringify(user)}`);
    } catch (error) {
      this.LOGGER.error('Error creating default user:', error);
    }
  }
}
