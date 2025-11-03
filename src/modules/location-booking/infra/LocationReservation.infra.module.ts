import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationAvailabilityEntity } from '@/modules/location-booking/domain/LocationAvailability.entity';
import { LocationBookingConfigEntity } from '@/modules/location-booking/domain/LocationBookingConfig.entity';
import { LocationBookingEntity } from '@/modules/location-booking/domain/LocationBooking.entity';
import { LocationBookingDateEntity } from '@/modules/location-booking/domain/LocationBookingDate.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LocationAvailabilityEntity,
      LocationBookingConfigEntity,
      LocationBookingEntity,
      LocationBookingDateEntity,
    ]),
  ],
})
export class LocationReservationInfraModule {}
