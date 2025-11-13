import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationEntity } from '@/modules/business/domain/Location.entity';
import { LocationTagsEntity } from '@/modules/business/domain/LocationTags.entity';
import { TagEntity } from '@/modules/utility/domain/Tag.entity';
import { UserProfileEntity } from '@/modules/account/domain/UserProfile.entity';
import { ItineraryEntity } from '../domain/Itinerary.entity';
import { ItineraryLocationEntity } from '../domain/ItineraryLocation.entity';
import { ILocationRepository } from './repository/ILocation.repository';
import { IUserProfileRepository } from './repository/IUserProfile.repository';
import { LocationRepository } from './repository/Location.repository';
import { UserProfileRepository } from './repository/UserProfile.repository';
import { ItineraryRepository } from './Itinerary.repository';
import { ItineraryLocationRepository } from './ItineraryLocation.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LocationEntity,
      LocationTagsEntity,
      TagEntity,
      UserProfileEntity,
      ItineraryEntity,
      ItineraryLocationEntity,
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
    ItineraryRepository,
    ItineraryLocationRepository,
  ],
  exports: [
    ILocationRepository,
    IUserProfileRepository,
    ItineraryRepository,
    ItineraryLocationRepository,
  ],
})
export class JourneyInfraModule {}
