import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { AccountUserService } from '@/modules/account/app/impl/Account.user.service';
import { AccountUserController } from '@/modules/account/interfaces/account.user.controller';
import { AccountPublicController } from '@/modules/account/interfaces/account.public.controller';
import { IAccountUserService } from '@/modules/account/app/IAccount.user.service';

@Module({
  imports: [AuthModule],
  controllers: [AccountUserController, AccountPublicController],
  providers: [
    {
      provide: IAccountUserService,
      useClass: AccountUserService,
    },
  ],
})
export class AccountModule {}
