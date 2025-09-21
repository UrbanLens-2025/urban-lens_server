import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from '@/modules/auth/domain/Account.entity';
import { AccountRepository } from '@/modules/auth/infra/repository/Account.repository';
import { RedisRegisterConfirmRepository } from '@/modules/auth/infra/repository/RedisRegisterConfirm.repository';

const repositories = [AccountRepository, RedisRegisterConfirmRepository];

@Module({
  imports: [TypeOrmModule.forFeature([AccountEntity])],
  providers: repositories,
  exports: repositories,
})
export class AuthInfraModule {}
