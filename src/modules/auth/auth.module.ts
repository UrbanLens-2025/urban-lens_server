import { Module } from '@nestjs/common';
import { AuthService } from '@/modules/auth/app/auth.service';
import { AuthPublicController } from '@/modules/auth/interfaces/auth.public.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/modules/auth/domain/User.entity';
import { UserRepository } from '@/modules/auth/infra/repository/User.repository';
import { NotificationModule } from '@/modules/notification/Notification.module';
import { RedisRegisterConfirmRepository } from '@/modules/auth/infra/repository/RedisRegisterConfirm.repository';
import { AccountSeederService } from '@/modules/auth/app/account-seeder.service';
import { AuthDevOnlyController } from '@/modules/auth/interfaces/auth.dev-only.controller';
import { TokenModule } from '@/common/core/token/token.module';
import { AuthUserController } from '@/modules/auth/interfaces/auth.user.controller';
import { UserService } from '@/modules/auth/app/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
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
    UserRepository,
    RedisRegisterConfirmRepository,
    // app
    UserService,
    AuthService,
    AccountSeederService,
  ],
  exports: [],
})
export class AuthModule {}
