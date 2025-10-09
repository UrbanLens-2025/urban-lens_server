import { Module } from '@nestjs/common';
import { BusinessInfraModule } from '@/modules/business/infra/Business.infra.module';
import { LocationController } from './interfaces/Location.controller';
import { CheckInController } from './interfaces/CheckIn.controller';
import { LocationService } from './app/impl/Location.service';
import { CheckInService } from './app/impl/CheckIn.service';
import { ILocationService } from './app/ILocation.service';
import { ICheckInService } from './app/ICheckIn.service';
import { AccountInfraModule } from '@/modules/account/infra/Account.infra.module';
import { TokenModule } from '@/common/core/token/token.module';

@Module({
  imports: [BusinessInfraModule, AccountInfraModule, TokenModule],
  controllers: [LocationController, CheckInController],
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
