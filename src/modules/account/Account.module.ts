import { Module } from '@nestjs/common';
import { AccountUserController } from '@/modules/account/interfaces/Account.user.controller';
import { AccountPublicController } from '@/modules/account/interfaces/Account.public.controller';
import { IAccountQueryService } from '@/modules/account/app/IAccountQuery.service';
import { AccountInfraModule } from '@/modules/account/infra/Account.infra.module';
import { AccountCreatorController } from '@/modules/account/interfaces/Account.creator.controller';
import { AccountOwnerController } from '@/modules/account/interfaces/Account.owner.controller';
import { IOnboardService } from '@/modules/account/app/IOnboard.service';
import { OnboardService } from '@/modules/account/app/impl/Onboard.service';
import { NotificationModule } from '../notification/Notification.module';
import { FileStorageModule } from '@/modules/file-storage/FileStorage.module';
import { IFollowService } from './app/IFollow.service';
import { FollowService } from './app/impl/Follow.service';
import { FollowUserController } from './interfaces/Follow.user.controller';
import { TokenModule } from '@/common/core/token/token.module';
import { IAccountProfileManagementService } from '@/modules/account/app/IAccountProfileManagement.service';
import { AccountProfileManagementService } from '@/modules/account/app/impl/AccountProfileManagement.service';
import { GamificationInfraModule } from '@/modules/gamification/infra/Gamification.infra.module';
import { AccountHelper } from '@/modules/account/app/helper/Account.helper';
import { AccountAdminController } from '@/modules/account/interfaces/Account.admin.controller';
import { AccountQueryService } from '@/modules/account/app/impl/AccountQuery.service';
import { AccountPrivateController } from '@/modules/account/interfaces/Account.private.controller';
import { IFavoriteLocationManagementService } from '@/modules/account/app/IFavoriteLocationManagement.service';
import { FavoriteLocationManagementService } from '@/modules/account/app/impl/FavoriteLocationManagement.service';
import { IFavoriteLocationQueryService } from '@/modules/account/app/IFavoriteLocationQuery.service';
import { FavoriteLocationQueryService } from '@/modules/account/app/impl/FavoriteLocationQuery.service';
import { FavoriteLocationPrivateController } from '@/modules/account/interfaces/FavoriteLocation.private.controller';

@Module({
  imports: [
    AccountInfraModule,
    NotificationModule,
    FileStorageModule,
    TokenModule,
    GamificationInfraModule,
  ],
  controllers: [
    AccountAdminController,
    AccountUserController,
    AccountPublicController,
    AccountCreatorController,
    AccountOwnerController,
    AccountPrivateController,
    FollowUserController,
    FavoriteLocationPrivateController,
  ],
  providers: [
    {
      provide: IAccountQueryService,
      useClass: AccountQueryService,
    },
    {
      provide: IOnboardService,
      useClass: OnboardService,
    },
    {
      provide: IAccountProfileManagementService,
      useClass: AccountProfileManagementService,
    },
    {
      provide: IFollowService,
      useClass: FollowService,
    },
    {
      provide: IFavoriteLocationManagementService,
      useClass: FavoriteLocationManagementService,
    },
    {
      provide: IFavoriteLocationQueryService,
      useClass: FavoriteLocationQueryService,
    },
    AccountHelper,
  ],
  exports: [AccountHelper],
})
export class AccountModule {}
