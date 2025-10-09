import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagRepository } from '@/modules/account/infra/repository/Tag.repository';
import { TagEntity } from '@/modules/account/domain/Tag.entity';
import { UserTagsEntity } from '@/modules/account/domain/UserTags.entity';
import { UserTagsRepository } from '@/modules/account/infra/repository/UserTags.repository';
import { BusinessRepository } from '@/modules/account/infra/repository/Business.repository';
import { ProfileRepository } from '@/modules/account/infra/repository/Profile.repository';
import { BusinessEntity } from '../domain/Business.entity';
import { ProfileEntity } from '../domain/Profile.entity';

const repositories = [
  TagRepository,
  UserTagsRepository,
  BusinessRepository,
  ProfileRepository,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TagEntity,
      UserTagsEntity,
      BusinessEntity,
      ProfileEntity,
    ]),
  ],
  providers: repositories,
  exports: repositories,
})
export class AccountInfraModule {}
