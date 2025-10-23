import { Module } from '@nestjs/common';
import { RedisRegisterConfirmRepository } from '@/modules/auth/infra/repository/RedisRegisterConfirm.repository';

const repositories = [RedisRegisterConfirmRepository];

@Module({
  providers: repositories,
  exports: repositories,
})
export class AuthInfraModule {}
