import { Module } from '@nestjs/common';
import { ReportInfraModule } from '@/modules/report/infra/Report.infra.module';
import { ReportPrivateController } from '@/modules/report/interfaces/Report.private.controller';
import { IReportCreationService } from '@/modules/report/app/IReportCreation.service';
import { ReportCreationService } from '@/modules/report/app/impl/ReportCreation.service';
import { ReportReasonManagementService } from '@/modules/report/app/impl/ReportReasonManagement.service';
import { IReportReasonManagementService } from '@/modules/report/app/IReportReasonManagement.service';
import { IReportReasonQueryService } from '@/modules/report/app/IReportReasonQuery.service';
import { ReportReasonQueryService } from '@/modules/report/app/impl/ReportReasonQuery.service';
import { ReportReasonAdminController } from '@/modules/report/interfaces/ReportReason.admin.controller';
import { ReportReasonPublicController } from '@/modules/report/interfaces/ReportReason.public.controller';
import { IReportQueryService } from '@/modules/report/app/IReportQuery.service';
import { ReportQueryService } from '@/modules/report/app/impl/ReportQuery.service';
import { ReportAdminController } from '@/modules/report/interfaces/Report.admin.controller';
import { IReportManagementService } from '@/modules/report/app/IReportManagement.service';
import { ReportManagementService } from '@/modules/report/app/impl/ReportManagement.service';
import { EventModule } from '@/modules/event/event.module';
import { PostModule } from '@/modules/post/Post.module';
import { AccountModule } from '@/modules/account/Account.module';
import { BusinessModule } from '@/modules/business/Business.module';
import { LocationBookingModule } from '@/modules/location-booking/LocationBooking.module';
import { IPenaltyService } from '@/modules/report/app/IPenalty.service';
import { PenaltyService } from '@/modules/report/app/impl/Penalty.service';
import { PenaltyAdministeredListener } from '@/modules/report/app/event-listeners/PenaltyAdministered.listener';
import { PenaltyAdminController } from '@/modules/report/interfaces/Penalty.admin.controller';
import { PenaltyUserController } from '@/modules/report/interfaces/Penalty.user.controller';
import { PenaltyOwnerController } from '@/modules/report/interfaces/Penalty.owner.controller';
import { PenaltyCreatorController } from '@/modules/report/interfaces/Penalty.creator.controller';
@Module({
  imports: [
    ReportInfraModule,
    EventModule,
    PostModule,
    AccountModule,
    BusinessModule,
    LocationBookingModule,
  ],
  providers: [
    {
      provide: IReportCreationService,
      useClass: ReportCreationService,
    },
    {
      provide: IReportReasonManagementService,
      useClass: ReportReasonManagementService,
    },
    {
      provide: IReportReasonQueryService,
      useClass: ReportReasonQueryService,
    },
    {
      provide: IReportQueryService,
      useClass: ReportQueryService,
    },
    {
      provide: IReportManagementService,
      useClass: ReportManagementService,
    },
    {
      provide: IPenaltyService,
      useClass: PenaltyService,
    },
    PenaltyAdministeredListener,
  ],
  controllers: [
    ReportPrivateController,
    ReportAdminController,
    ReportReasonAdminController,
    ReportReasonPublicController,
    PenaltyAdminController,
    PenaltyUserController,
    PenaltyOwnerController,
    PenaltyCreatorController,
  ],
})
export class ReportModule {}
