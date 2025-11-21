import { Module } from '@nestjs/common';
import { AuthService } from '@/modules/auth/app/impl/Auth.service';
import { AuthPublicController } from '@/modules/auth/interfaces/auth.public.controller';
import { NotificationModule } from '@/modules/notification/Notification.module';
import { AccountSeederHelper } from '@/modules/auth/app/helper/AccountSeeder.helper';
import { AuthDevOnlyController } from '@/modules/auth/interfaces/auth.dev-only.controller';
import { TokenModule } from '@/common/core/token/token.module';
import { UserAuthService } from '@/modules/auth/app/impl/User.auth.service';
import { IAuthService } from '@/modules/auth/app/IAuth.service';
import { IUserAuthService } from '@/modules/auth/app/IUser.auth.service';
import { AuthInfraModule } from '@/modules/auth/infra/auth.infra.module';
import { AccountInfraModule } from '@/modules/account/infra/Account.infra.module';
import { FileStorageModule } from '@/modules/file-storage/FileStorage.module';
import { AuthController } from '@/modules/auth/interfaces/auth.controller';
import { AccountModule } from '@/modules/account/Account.module';
import { WalletModule } from '@/modules/wallet/Wallet.module';

@Module({
  imports: [
    AuthInfraModule,
    NotificationModule,
    TokenModule,
    AccountInfraModule,
    FileStorageModule,
    AccountModule,
    WalletModule,
  ],
  controllers: [AuthPublicController, AuthDevOnlyController, AuthController],
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
