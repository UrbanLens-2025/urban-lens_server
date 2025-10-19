import { Module } from '@nestjs/common';
import { LocationReservationInfraModule } from '@/modules/location-reservation/infra/LocationReservation.infra.module';
import { LocationAvailabilityOwnerController } from '@/modules/location-reservation/interfaces/LocationAvailability.owner.controller';
import { ILocationAvailabilityManagementService } from '@/modules/location-reservation/app/ILocationAvailabilityManagement.service';
import { LocationAvailabilityManagementService } from '@/modules/location-reservation/app/impl/LocationAvailabilityManagement.service';
import { ILocationBookingConfigManagementService } from '@/modules/location-reservation/app/ILocationBookingConfigManagement.service';
import { LocationBookingConfigManagementService } from '@/modules/location-reservation/app/impl/LocationBookingConfigManagement.service';
import { LocationBookingConfigOwnerController } from '@/modules/location-reservation/interfaces/LocationBookingConfig.owner.controller';
import { LocationAvailabilityCreatorController } from '@/modules/location-reservation/interfaces/LocationAvailability.creator.controller';

@Module({
  imports: [LocationReservationInfraModule],
  controllers: [
    LocationAvailabilityOwnerController,
    LocationAvailabilityCreatorController,
    LocationBookingConfigOwnerController,
  ],
  providers: [
    {
      provide: ILocationAvailabilityManagementService,
      useClass: LocationAvailabilityManagementService,
    },
    {
      provide: ILocationBookingConfigManagementService,
      useClass: LocationBookingConfigManagementService,
    },
  ],
})
export class LocationReservationModule {}
