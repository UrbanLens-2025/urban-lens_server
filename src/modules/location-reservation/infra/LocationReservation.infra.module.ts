import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationAvailabilityEntity } from '@/modules/location-reservation/domain/LocationAvailability.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LocationAvailabilityEntity])],
})
export class LocationReservationInfraModule {}
