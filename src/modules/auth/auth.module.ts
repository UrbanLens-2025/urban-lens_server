import { Module } from '@nestjs/common';
import { AuthService } from '@/modules/auth/app/impl/Auth.service';
import { AuthPublicController } from '@/modules/auth/interfaces/auth.public.controller';
import { NotificationModule } from '@/modules/notification/Notification.module';
import { AccountSeederHelper } from '@/modules/auth/app/helper/AccountSeeder.helper';
import { AuthDevOnlyController } from '@/modules/auth/interfaces/auth.dev-only.controller';
import { TokenModule } from '@/common/core/token/token.module';
import { AuthUserController } from '@/modules/auth/interfaces/auth.user.controller';
import { UserAuthService } from '@/modules/auth/app/impl/User.auth.service';
import { IAuthService } from '@/modules/auth/app/IAuth.service';
import { IUserAuthService } from '@/modules/auth/app/IUser.auth.service';
import { AuthInfraModule } from '@/modules/auth/infra/auth.infra.module';

@Module({
  imports: [AuthInfraModule, NotificationModule, TokenModule],
  controllers: [
    AuthPublicController,
    AuthDevOnlyController,
    AuthUserController,
  ],
  providers: [
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
  exports: [AuthInfraModule],
})
export class AuthModule {}
