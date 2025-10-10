import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagRepository } from '@/modules/account/infra/repository/Tag.repository';
import { TagEntity } from '@/modules/account/domain/Tag.entity';
import { UserTagsEntity } from '@/modules/account/domain/UserTags.entity';
import { UserTagsRepository } from '@/modules/account/infra/repository/UserTags.repository';
import { BusinessRepository } from '@/modules/account/infra/repository/Business.repository';
import { UserProfileRepository } from '@/modules/account/infra/repository/UserProfile.repository';
import { BusinessEntity } from '../domain/Business.entity';
import { UserProfileEntity } from '../domain/UserProfile.entity';
import { CreatorProfileRepository } from '@/modules/account/infra/repository/CreatorProfile.repository';
import { CreatorProfileEntity } from '@/modules/account/domain/CreatorProfile.entity';

const repositories = [
  TagRepository,
  UserTagsRepository,
  BusinessRepository,
  UserProfileRepository,
  CreatorProfileRepository,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TagEntity,
      UserTagsEntity,
      BusinessEntity,
      UserProfileEntity,
      CreatorProfileEntity,
    ]),
  ],
  providers: repositories,
  exports: repositories,
})
export class AccountInfraModule {}
