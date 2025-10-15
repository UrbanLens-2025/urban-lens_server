import { Module } from '@nestjs/common';
import { LocationReservationInfraModule } from '@/modules/location-reservation/infra/LocationReservation.infra.module';
import { LocationAvailabilityOwnerController } from '@/modules/location-reservation/interfaces/LocationAvailability.owner.controller';
import { ILocationAvailabilityManagementService } from '@/modules/location-reservation/app/ILocationAvailabilityManagement.service';
import { LocationAvailabilityManagementService } from '@/modules/location-reservation/app/impl/LocationAvailabilityManagement.service';

@Module({
  imports: [LocationReservationInfraModule],
  controllers: [LocationAvailabilityOwnerController],
  providers: [
    {
      provide: ILocationAvailabilityManagementService,
      useClass: LocationAvailabilityManagementService,
    },
  ],
})
export class LocationReservationModule {}
