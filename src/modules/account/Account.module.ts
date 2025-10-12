import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { AccountUserService } from '@/modules/account/app/impl/Account.user.service';
import { AccountUserController } from '@/modules/account/interfaces/Account.user.controller';
import { AccountPublicController } from '@/modules/account/interfaces/Account.public.controller';
import { IAccountUserService } from '@/modules/account/app/IAccount.user.service';
import { AccountInfraModule } from '@/modules/account/infra/Account.infra.module';
import { TagAdminController } from '@/modules/account/interfaces/Tag.admin.controller';
import { AccountCreatorController } from '@/modules/account/interfaces/Account.creator.controller';
import { AccountOwnerController } from '@/modules/account/interfaces/Account.owner.controller';
import { AccountAdminController } from '@/modules/account/interfaces/Account.admin.controller';
import { IOnboardService } from '@/modules/account/app/IOnboard.service';
import { OnboardService } from '@/modules/account/app/impl/Onboard.service';
import { ITagService } from '@/modules/account/app/ITag.service';
import { TagService } from '@/modules/account/app/impl/Tag.service';
import { TagPublicController } from '@/modules/account/interfaces/Tag.public.controller';
import { IBusinessService } from './app/IBusiness.service';
import { BusinessService } from './app/impl/Business.service';
import { NotificationModule } from '../notification/Notification.module';

@Module({
  imports: [AccountInfraModule, AuthModule, NotificationModule],
  controllers: [
    AccountUserController,
    AccountPublicController,
    AccountCreatorController,
    AccountOwnerController,
    AccountAdminController,
    TagAdminController,
    TagPublicController,
  ],
  providers: [
    {
      provide: IAccountUserService,
      useClass: AccountUserService,
    },
    {
      provide: ITagService,
      useClass: TagService,
    },
    {
      provide: IOnboardService,
      useClass: OnboardService,
    },
    {
      provide: IBusinessService,
      useClass: BusinessService,
    },
  ],
})
export class AccountModule {}
