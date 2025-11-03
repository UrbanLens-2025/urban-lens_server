import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationEntity } from '../domain/Location.entity';
import { CheckInEntity } from '../domain/CheckIn.entity';
import { LocationRepository } from './repository/Location.repository';
import { CheckInRepository } from './repository/CheckIn.repository';
import { LocationRequestEntity } from '@/modules/business/domain/LocationRequest.entity';
import { LocationRequestTagsEntity } from '@/modules/business/domain/LocationRequestTags.entity';
import { LocationTagsEntity } from '@/modules/business/domain/LocationTags.entity';
import { LocationOpeningHoursEntity } from '@/modules/business/domain/LocationOpeningHours.entity';

const repositories = [LocationRepository, CheckInRepository];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LocationEntity,
      LocationTagsEntity,
      LocationOpeningHoursEntity,
      CheckInEntity,
      LocationRequestEntity,
      LocationRequestTagsEntity,
    ]),
  ],
  providers: repositories,
  exports: repositories,
})
export class BusinessInfraModule {}
