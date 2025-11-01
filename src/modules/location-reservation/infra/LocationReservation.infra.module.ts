import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationAvailabilityEntity } from '@/modules/location-reservation/domain/LocationAvailability.entity';
import { LocationBookingConfigEntity } from '@/modules/location-reservation/domain/LocationBookingConfig.entity';
import { LocationBookingEntity } from '@/modules/location-reservation/domain/LocationBooking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LocationAvailabilityEntity,
      LocationBookingConfigEntity,
      LocationBookingEntity,
    ]),
  ],
})
export class LocationReservationInfraModule {}
