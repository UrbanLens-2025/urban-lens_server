import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTagsEntity } from '@/modules/account/domain/UserTags.entity';
import { UserTagsRepository } from '@/modules/account/infra/repository/UserTags.repository';
import { BusinessRepository } from '@/modules/account/infra/repository/Business.repository';
import { UserProfileRepository } from '@/modules/account/infra/repository/UserProfile.repository';
import { BusinessEntity } from '../domain/Business.entity';
import { UserProfileEntity } from '../domain/UserProfile.entity';
import { CreatorProfileEntity } from '@/modules/account/domain/CreatorProfile.entity';
import { FollowRepository } from '@/modules/account/infra/repository/Follow.repository';
import { FollowEntity } from '@/modules/account/domain/Follow.entity';
import { AccountEntity } from '@/modules/account/domain/Account.entity';
import { AccountRepository } from '@/modules/account/infra/repository/Account.repository';
import { FavoriteLocationEntity } from '@/modules/account/domain/FavoriteLocation.entity';
import { UserPostsUpdaterSubscriber } from '@/modules/account/infra/subscriber/UserPostsUpdater.subscriber';

const repositories = [
  UserTagsRepository,
  BusinessRepository,
  UserProfileRepository,
  FollowRepository,
  AccountRepository,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserTagsEntity,
      BusinessEntity,
      UserProfileEntity,
      CreatorProfileEntity,
      FollowEntity,
      AccountEntity,
      FavoriteLocationEntity,
    ]),
  ],
  providers: [...repositories, UserPostsUpdaterSubscriber],
  exports: repositories,
})
export class AccountInfraModule {}
