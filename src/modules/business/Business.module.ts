import { Module } from '@nestjs/common';
import { BusinessInfraModule } from '@/modules/business/infra/Business.infra.module';
import { LocationUserController } from './interfaces/Location.user.controller';
import { AccountInfraModule } from '@/modules/account/infra/Account.infra.module';
import { TokenModule } from '@/common/core/token/token.module';
import { LocationPublicController } from './interfaces/Location.public.controller';
import { LocationOwnerController } from './interfaces/Location.owner.controller';
import { LocationAdminController } from './interfaces/Location.admin.controller';
import { LocationRequestBusinessController } from '@/modules/business/interfaces/LocationRequest.business.controller';
import { ILocationRequestManagementService } from '@/modules/business/app/ILocationRequestManagement.service';
import { LocationRequestManagementService } from '@/modules/business/app/impl/LocationRequestManagement.service';
import { LocationRequestAdminController } from '@/modules/business/interfaces/LocationRequest.admin.controller';
import { ILocationQueryService } from '@/modules/business/app/ILocationQuery.service';
import { LocationQueryService } from '@/modules/business/app/impl/LocationQuery.service';
import { ILocationManagementService } from '@/modules/business/app/ILocationManagement.service';
import { LocationManagementService } from '@/modules/business/app/impl/LocationManagement.service';
import { FileStorageModule } from '@/modules/file-storage/FileStorage.module';
import { ICheckInV2Service } from '@/modules/business/app/ICheckInV2.service';
import { CheckInV2Service } from '@/modules/business/app/impl/CheckInV2.service';
import { LocationRequestQueryService } from '@/modules/business/app/impl/LocationRequestQuery.service';
import { ILocationRequestQueryService } from '@/modules/business/app/ILocationRequestQuery.service';
import { AccountModule } from '@/modules/account/Account.module';
import { LocationSubmissionUserController } from '@/modules/business/interfaces/LocationSubmission.user.controller';

@Module({
  imports: [
    BusinessInfraModule,
    AccountInfraModule,
    TokenModule,
    FileStorageModule,
    AccountModule,
  ],
  controllers: [
    LocationRequestBusinessController,
    LocationRequestAdminController,
    LocationSubmissionUserController,
    LocationUserController,
    LocationPublicController,
    LocationOwnerController,
    LocationAdminController,
  ],
  providers: [
    {
      provide: ICheckInV2Service,
      useClass: CheckInV2Service,
    },
    {
      provide: ILocationRequestManagementService,
      useClass: LocationRequestManagementService,
    },
    {
      provide: ILocationRequestQueryService,
      useClass: LocationRequestQueryService,
    },
    {
      provide: ILocationQueryService,
      useClass: LocationQueryService,
    },
    {
      provide: ILocationManagementService,
      useClass: LocationManagementService,
    },
  ],
  exports: [BusinessInfraModule],
})
export class BusinessModule {}
