import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationEntity } from '@/modules/business/domain/Location.entity';
import { LocationTagsEntity } from '@/modules/business/domain/LocationTags.entity';
import { TagEntity } from '@/modules/utility/domain/Tag.entity';
import { UserProfileEntity } from '@/modules/account/domain/UserProfile.entity';
import { ILocationRepository } from './repository/ILocation.repository';
import { IUserProfileRepository } from './repository/IUserProfile.repository';
import { LocationRepository } from './repository/Location.repository';
import { UserProfileRepository } from './repository/UserProfile.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LocationEntity,
      LocationTagsEntity,
      TagEntity,
      UserProfileEntity,
    ]),
  ],
  providers: [
    {
      provide: ILocationRepository,
      useClass: LocationRepository,
    },
    {
      provide: IUserProfileRepository,
      useClass: UserProfileRepository,
    },
  ],
  exports: [ILocationRepository, IUserProfileRepository],
})
export class JourneyInfraModule {}
