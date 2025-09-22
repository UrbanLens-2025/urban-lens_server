import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { AccountUserService } from '@/modules/account/app/account.user.service';
import { AccountUserController } from '@/modules/account/interfaces/account.user.controller';
import { AccountPublicController } from '@/modules/account/interfaces/account.public.controller';

@Module({
  imports: [AuthModule],
  providers: [AccountUserService],
  controllers: [AccountUserController, AccountPublicController],
})
export class AccountModule {}
