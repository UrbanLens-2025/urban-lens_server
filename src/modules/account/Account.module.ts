import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { AccountUserService } from '@/modules/account/app/impl/Account.user.service';
import { AccountUserController } from '@/modules/account/interfaces/account.user.controller';
import { AccountPublicController } from '@/modules/account/interfaces/account.public.controller';
import { IAccountUserService } from '@/modules/account/app/IAccount.user.service';
import { AccountInfraModule } from '@/modules/account/infra/Account.infra.module';
import { ITagUserService } from '@/modules/account/app/ITag.user.service';
import { TagUserService } from '@/modules/account/app/impl/Tag.user.service';
import { ITagAdminService } from '@/modules/account/app/ITag.admin.service';
import { TagAdminService } from '@/modules/account/app/impl/Tag.admin.service';
import { TagAdminController } from '@/modules/account/interfaces/Tag.admin.controller';
import { TagUserController } from '@/modules/account/interfaces/Tag.user.controller';

@Module({
  imports: [AccountInfraModule, AuthModule],
  controllers: [
    AccountUserController,
    AccountPublicController,
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
  ],
})
export class AccountModule {}
