import { Module } from '@nestjs/common';
import { AuthService } from '@/modules/auth/app/auth.service';
import { AuthPublicController } from '@/modules/auth/interfaces/auth.public.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from '@/modules/auth/domain/Account.entity';
import { AccountRepository } from '@/modules/auth/infra/repository/Account.repository';
import { NotificationModule } from '@/modules/notification/Notification.module';
import { RedisRegisterConfirmRepository } from '@/modules/auth/infra/repository/RedisRegisterConfirm.repository';
import { AccountSeederService } from '@/modules/auth/app/AccountSeeder.service';
import { AuthDevOnlyController } from '@/modules/auth/interfaces/auth.dev-only.controller';
import { TokenModule } from '@/common/core/token/token.module';
import { AuthUserController } from '@/modules/auth/interfaces/auth.user.controller';
import { UserAuthService } from '@/modules/auth/app/User.auth.service';

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
    UserAuthService,
    AuthService,
    AccountSeederService,
  ],
  exports: [AccountRepository],
})
export class AuthModule {}
