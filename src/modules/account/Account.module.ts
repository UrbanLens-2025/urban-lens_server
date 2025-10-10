import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { AccountUserService } from '@/modules/account/app/impl/Account.user.service';
import { AccountUserController } from '@/modules/account/interfaces/Account.user.controller';
import { AccountPublicController } from '@/modules/account/interfaces/Account.public.controller';
import { IAccountUserService } from '@/modules/account/app/IAccount.user.service';
import { AccountInfraModule } from '@/modules/account/infra/Account.infra.module';
import { ITagUserService } from '@/modules/account/app/ITag.user.service';
import { TagUserService } from '@/modules/account/app/impl/Tag.user.service';
import { ITagAdminService } from '@/modules/account/app/ITag.admin.service';
import { TagAdminService } from '@/modules/account/app/impl/Tag.admin.service';
import { TagAdminController } from '@/modules/account/interfaces/Tag.admin.controller';
import { TagUserController } from '@/modules/account/interfaces/Tag.user.controller';
import { AccountCreatorController } from '@/modules/account/interfaces/Account.creator.controller';
import { AccountOwnerController } from '@/modules/account/interfaces/Account.owner.controller';
import { AccountAdminController } from '@/modules/account/interfaces/Account.admin.controller';
import { IOnboardService } from '@/modules/account/app/IOnboard.service';
import { OnboardService } from '@/modules/account/app/impl/Onboard.service';

@Module({
  imports: [AccountInfraModule, AuthModule],
  controllers: [
    AccountUserController,
    AccountPublicController,
    AccountCreatorController,
    AccountOwnerController,
    AccountAdminController,
    TagAdminController,
    TagUserController,
  ],
  providers: [
    {
      provide: IAccountUserService,
      useClass: AccountUserService,
    },
    {
      provide: ITagUserService,
      useClass: TagUserService,
    },
    {
      provide: ITagAdminService,
      useClass: TagAdminService,
    },
    {
      provide: IOnboardService,
      useClass: OnboardService,
    },
    // {
    //   provide: IBusinessService,
    //   useClass: BusinessService,
    // },
  ],
})
export class AccountModule {}
