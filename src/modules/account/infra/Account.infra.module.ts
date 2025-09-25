import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagRepository } from '@/modules/account/infra/repository/Tag.repository';
import { TagEntity } from '@/modules/account/domain/Tag.entity';
import { UserTagsEntity } from '@/modules/account/domain/UserTags.entity';
import { UserTagsRepository } from '@/modules/account/infra/repository/UserTags.repository';

const repositories = [TagRepository, UserTagsRepository];

@Module({
  imports: [TypeOrmModule.forFeature([TagEntity, UserTagsEntity])],
  providers: repositories,
  exports: repositories,
})
export class AccountInfraModule {}
