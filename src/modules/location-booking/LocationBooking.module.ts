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
import { LocationCreatorController } from '@/modules/location-booking/interfaces/Location.creator.controller';
import { ILocationBookingManagementService } from '@/modules/location-booking/app/ILocationBookingManagement.service';
import { LocationBookingManagementService } from '@/modules/location-booking/app/impl/LocationBookingManagement.service';
import { LocationBookingOwnerController } from '@/modules/location-booking/interfaces/LocationBooking.owner.controller';
import { LocationBookingCreatorController } from '@/modules/location-booking/interfaces/LocationBooking.creator.controller';
import { ILocationBookingQueryService } from '@/modules/location-booking/app/ILocationBookingQuery.service';
import { LocationBookingQueryService } from '@/modules/location-booking/app/impl/LocationBookingQuery.service';
import { WalletModule } from '@/modules/wallet/Wallet.module';
import { LocationBookingConfigCreatorController } from '@/modules/location-booking/interfaces/LocationBookingConfig.creator.controller';

@Module({
  imports: [LocationReservationInfraModule, WalletModule],
  controllers: [
    LocationAvailabilityOwnerController,
    LocationAvailabilityCreatorController,
    LocationBookingConfigOwnerController,
    LocationCreatorController,
    LocationBookingOwnerController,
    LocationBookingCreatorController,
    LocationBookingConfigCreatorController,
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
      provide: ILocationBookingManagementService,
      useClass: LocationBookingManagementService,
    },
    {
      provide: ILocationBookingQueryService,
      useClass: LocationBookingQueryService,
    },
  ],
  exports: [ILocationBookingManagementService],
})
export class LocationBookingModule {}
