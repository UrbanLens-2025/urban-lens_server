import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { AccountUserService } from '@/modules/account/app/impl/Account.user.service';
import { AccountUserController } from '@/modules/account/interfaces/Account.user.controller';
import { AccountPublicController } from '@/modules/account/interfaces/Account.public.controller';
import { IAccountUserService } from '@/modules/account/app/IAccount.user.service';
import { AccountInfraModule } from '@/modules/account/infra/Account.infra.module';
import { AccountCreatorController } from '@/modules/account/interfaces/Account.creator.controller';
import { AccountOwnerController } from '@/modules/account/interfaces/Account.owner.controller';
import { AccountAdminController } from '@/modules/account/interfaces/Account.admin.controller';
import { IOnboardService } from '@/modules/account/app/IOnboard.service';
import { OnboardService } from '@/modules/account/app/impl/Onboard.service';
import { IBusinessService } from './app/IBusiness.service';
import { BusinessService } from './app/impl/Business.service';
import { NotificationModule } from '../notification/Notification.module';
import { FileStorageModule } from '@/modules/file-storage/FileStorage.module';
import { IFollowService } from './app/IFollow.service';
import { FollowService } from './app/impl/Follow.service';
import { FollowUserController } from './interfaces/Follow.user.controller';
import { TokenModule } from '@/common/core/token/token.module';
import { IAccountProfileService } from '@/modules/account/app/IAccountProfile.service';
import { AccountProfileService } from '@/modules/account/app/impl/AccountProfile.service';
import { GamificationInfraModule } from '@/modules/gamification/infra/Gamification.infra.module';
import { IAccountQueryService } from '@/modules/account/app/IAccountQuery.service';
import { AccountQueryService } from '@/modules/account/app/impl/AccountQuery.service';
import { AccountHelper } from '@/modules/account/app/helper/Account.helper';

@Module({
  imports: [
    AccountInfraModule,
    AuthModule,
    NotificationModule,
    FileStorageModule,
    TokenModule,
    GamificationInfraModule,
  ],
  controllers: [
    AccountUserController,
    AccountPublicController,
    AccountCreatorController,
    AccountOwnerController,
    AccountAdminController,
    FollowUserController,
  ],
  providers: [
    {
      provide: IAccountUserService,
      useClass: AccountUserService,
    },
    {
      provide: IAccountQueryService,
      useClass: AccountQueryService,
    },
    {
      provide: IOnboardService,
      useClass: OnboardService,
    },
    {
      provide: IAccountProfileService,
      useClass: AccountProfileService,
    },
    {
      provide: IBusinessService,
      useClass: BusinessService,
    },
    {
      provide: IFollowService,
      useClass: FollowService,
    },
    AccountHelper,
  ],
  exports: [AccountHelper],
})
export class AccountModule {}
