import { Module } from '@nestjs/common';
import { AuthService } from '@/modules/auth/app/impl/Auth.service';
import { AuthPublicController } from '@/modules/auth/interfaces/auth.public.controller';
import { AuthBusinessOwnerController } from '@/modules/auth/interfaces/auth.owner.controller';
import { NotificationModule } from '@/modules/notification/Notification.module';
import { AccountSeederHelper } from '@/modules/auth/app/helper/AccountSeeder.helper';
import { AuthDevOnlyController } from '@/modules/auth/interfaces/auth.dev-only.controller';
import { TokenModule } from '@/common/core/token/token.module';
import { AuthUserController } from '@/modules/auth/interfaces/auth.user.controller';
import { UserAuthService } from '@/modules/auth/app/impl/User.auth.service';
import { IAuthService } from '@/modules/auth/app/IAuth.service';
import { IUserAuthService } from '@/modules/auth/app/IUser.auth.service';
import { AuthInfraModule } from '@/modules/auth/infra/auth.infra.module';
import { AccountInfraModule } from '@/modules/account/infra/Account.infra.module';
import { IBusinessService } from '@/modules/account/app/IBusiness.service';
import { BusinessService } from '@/modules/account/app/impl/Business.service';

@Module({
  imports: [
    AuthInfraModule,
    NotificationModule,
    TokenModule,
    AccountInfraModule,
  ],
  controllers: [
    AuthPublicController,
    AuthDevOnlyController,
    AuthUserController,
    AuthBusinessOwnerController,
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
    {
      provide: IBusinessService,
      useClass: BusinessService,
    },
    AccountSeederHelper,
  ],
  exports: [AuthInfraModule],
})
export class AuthModule {}
