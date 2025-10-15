import { Module } from '@nestjs/common';
import { LocationReservationInfraModule } from '@/modules/location-reservation/infra/LocationReservation.infra.module';

@Module({
  imports: [LocationReservationInfraModule],
})
export class LocationReservationModule {}
