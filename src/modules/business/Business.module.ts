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

@Module({
  imports: [BusinessInfraModule, AccountInfraModule, TokenModule],
  controllers: [
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
  ],
  exports: [BusinessInfraModule],
})
export class BusinessModule {}
