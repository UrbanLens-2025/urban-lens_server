import { Module } from '@nestjs/common';
import { AuthService } from '@/modules/auth/app/impl/Auth.service';
import { AuthPublicController } from '@/modules/auth/interfaces/auth.public.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from '@/modules/auth/domain/Account.entity';
import { AccountRepository } from '@/modules/auth/infra/repository/Account.repository';
import { NotificationModule } from '@/modules/notification/Notification.module';
import { RedisRegisterConfirmRepository } from '@/modules/auth/infra/repository/RedisRegisterConfirm.repository';
import { AccountSeederHelper } from '@/modules/auth/app/helper/AccountSeeder.helper';
import { AuthDevOnlyController } from '@/modules/auth/interfaces/auth.dev-only.controller';
import { TokenModule } from '@/common/core/token/token.module';
import { AuthUserController } from '@/modules/auth/interfaces/auth.user.controller';
import { UserAuthService } from '@/modules/auth/app/impl/User.auth.service';
import { IAuthService } from '@/modules/auth/app/IAuth.service';
import { IUserAuthService } from '@/modules/auth/app/IUser.auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountEntity]),
    NotificationModule,
    TokenModule,
  ],
  controllers: [
    AuthPublicController,
    AuthDevOnlyController,
    AuthUserController,
  ],
  providers: [
    // repo
    AccountRepository,
    RedisRegisterConfirmRepository,
    // app
    {
      provide: IAuthService,
      useClass: AuthService,
    },
    {
      provide: IUserAuthService,
      useClass: UserAuthService,
    },
    AccountSeederHelper,
  ],
  exports: [AccountRepository],
})
export class AuthModule {}
