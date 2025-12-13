import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationEntity } from '../domain/Location.entity';
import { CheckInEntity } from '../domain/CheckIn.entity';
import { LocationRepository } from './repository/Location.repository';
import { CheckInRepository } from './repository/CheckIn.repository';
import { LocationRequestEntity } from '@/modules/business/domain/LocationRequest.entity';
import { LocationRequestTagsEntity } from '@/modules/business/domain/LocationRequestTags.entity';
import { LocationTagsEntity } from '@/modules/business/domain/LocationTags.entity';
import { LocationSuspensionEntity } from '@/modules/business/domain/LocationSuspension.entity';

const repositories = [LocationRepository, CheckInRepository];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LocationEntity,
      LocationTagsEntity,
      CheckInEntity,
      LocationRequestEntity,
      LocationRequestTagsEntity,
      LocationSuspensionEntity,
    ]),
  ],
  providers: [...repositories],
  exports: repositories,
})
export class BusinessInfraModule {}
