import { Module } from '@nestjs/common';
import { BusinessInfraModule } from '@/modules/business/infra/Business.infra.module';
import { LocationUserController } from './interfaces/Location.user.controller';
import { LocationService } from './app/impl/Location.service';
import { CheckInService } from './app/impl/CheckIn.service';
import { ILocationService } from './app/ILocation.service';
import { ICheckInService } from './app/ICheckIn.service';
import { AccountInfraModule } from '@/modules/account/infra/Account.infra.module';
import { TokenModule } from '@/common/core/token/token.module';
import { LocationPublicController } from './interfaces/Location.public.controller';
import { LocationBusinessController } from './interfaces/Location.business.controller';
import { LocationAdminController } from './interfaces/Location.admin.controller';
import { LocationRequestBusinessController } from '@/modules/business/interfaces/LocationRequest.business.controller';
import { ILocationRequestManagementService } from '@/modules/business/app/ILocationRequestManagement.service';
import { LocationRequestManagementService } from '@/modules/business/app/impl/LocationRequestManagement.service';
import { LocationRequestAdminController } from '@/modules/business/interfaces/LocationRequest.admin.controller';

@Module({
  imports: [BusinessInfraModule, AccountInfraModule, TokenModule],
  controllers: [
    LocationRequestBusinessController,
    LocationRequestAdminController,
    LocationUserController,
    LocationPublicController,
    LocationBusinessController,
    LocationAdminController,
  ],
  providers: [
    {
      provide: ILocationService,
      useClass: LocationService,
    },
    {
      provide: ICheckInService,
      useClass: CheckInService,
    },
    {
      provide: ILocationRequestManagementService,
      useClass: LocationRequestManagementService,
    },
  ],
  exports: [BusinessInfraModule],
})
export class BusinessModule {}
