import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagRepository } from '@/modules/account/infra/repository/Tag.repository';
import { TagEntity } from '@/modules/account/domain/Tag.entity';

const repositories = [TagRepository];

@Module({
  imports: [TypeOrmModule.forFeature([TagEntity])],
  providers: repositories,
  exports: repositories,
})
export class AccountInfraModule {}
