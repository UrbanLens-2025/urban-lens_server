import { Module } from '@nestjs/common';
import { LocationReservationInfraModule } from '@/modules/location-booking/infra/LocationReservation.infra.module';
import { LocationAvailabilityOwnerController } from '@/modules/location-booking/interfaces/LocationAvailability.owner.controller';
import { ILocationAvailabilityManagementService } from '@/modules/location-booking/app/ILocationAvailabilityManagement.service';
import { LocationAvailabilityManagementService } from '@/modules/location-booking/app/impl/LocationAvailabilityManagement.service';
import { ILocationBookingConfigManagementService } from '@/modules/location-booking/app/ILocationBookingConfigManagement.service';
import { LocationBookingConfigManagementService } from '@/modules/location-booking/app/impl/LocationBookingConfigManagement.service';
import { LocationBookingConfigOwnerController } from '@/modules/location-booking/interfaces/LocationBookingConfig.owner.controller';
import { LocationAvailabilityCreatorController } from '@/modules/location-booking/interfaces/LocationAvailability.creator.controller';
import { IBookableLocationSearchService } from '@/modules/location-booking/app/IBookableLocationSearch.service';
import { BookableLocationSearchService } from '@/modules/location-booking/app/impl/BookableLocationSearch.service';
import { LocationBookableCreatorController } from '@/modules/location-booking/interfaces/LocationBookable.creator.controller';
import { ILocationBookingService } from '@/modules/location-booking/app/ILocationBooking.service';
import { LocationBookingService } from '@/modules/location-booking/app/impl/LocationBooking.service';
import { LocationBookingOwnerController } from '@/modules/location-booking/interfaces/LocationBooking.owner.controller';
import { ILocationBookingQueryService } from '@/modules/location-booking/app/ILocationBookingQuery.service';
import { LocationBookingQueryService } from '@/modules/location-booking/app/impl/LocationBookingQuery.service';

@Module({
  imports: [LocationReservationInfraModule],
  controllers: [
    LocationAvailabilityOwnerController,
    LocationAvailabilityCreatorController,
    LocationBookingConfigOwnerController,
    LocationBookableCreatorController,
    LocationBookingOwnerController,
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
    {
      provide: IBookableLocationSearchService,
      useClass: BookableLocationSearchService,
    },
    {
      provide: ILocationBookingService,
      useClass: LocationBookingService,
    },
    {
      provide: ILocationBookingQueryService,
      useClass: LocationBookingQueryService,
    },
  ],
  exports: [ILocationBookingService],
})
export class LocationBookingModule {}
