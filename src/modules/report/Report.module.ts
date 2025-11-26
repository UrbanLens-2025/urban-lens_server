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
@Module({
  imports: [ReportInfraModule],
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
  ],
  controllers: [
    ReportPrivateController,
    ReportAdminController,
    ReportReasonAdminController,
    ReportReasonPublicController,
  ],
})
export class ReportModule {}
