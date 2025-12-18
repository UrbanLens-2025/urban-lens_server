import { CoreService } from '@/common/core/Core.service';
import { IReportProcessingService } from '@/modules/report/app/IReportProcessing.service';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ProcessReport_NoActionTakenDto } from '@/common/dto/report/ProcessReport_NoActionTaken.dto';
import { ProcessReport_MaliciousReportDto } from '@/common/dto/report/ProcessReport_MaliciousReport.dto';
import { ProcessReport_BookingRefundDto } from '@/common/dto/report/ProcessReport_BookingRefund.dto';
import { ProcessReport_TicketRefundDto } from '@/common/dto/report/ProcessReport_TicketRefund.dto';
import { ReportResponseDto } from '@/common/dto/report/res/Report.response.dto';
import { ReportRepositoryProvider } from '@/modules/report/infra/repository/Report.repository';
import { In } from 'typeorm';
import { ReportStatus } from '@/common/constants/ReportStatus.constant';
import { ReportResolutionActions } from '@/common/constants/ReportResolutionActions.constant';
import { ILocationBookingManagementService } from '@/modules/location-booking/app/ILocationBookingManagement.service';
import { MarkReportsFirstSeenDto } from '@/common/dto/report/MarkReportsFirstSeen.dto';
import { ReportResolvedByType } from '@/common/constants/ReportResolvedByType.constant';
import { ITicketOrderManagementService } from '@/modules/event/app/ITicketOrderManagement.service';
import { ReportEntityType } from '@/modules/report/domain/Report.entity';
import { ProcessReport_IssueApologyDto } from '@/common/dto/report/ProcessReport_IssueApology.dto';

@Injectable()
export class ReportProcessingService
  extends CoreService
  implements IReportProcessingService
{
  constructor(
    @Inject(ILocationBookingManagementService)
    private readonly locationBookingManagementService: ILocationBookingManagementService,
    @Inject(ITicketOrderManagementService)
    private readonly ticketOrderManagementService: ITicketOrderManagementService,
  ) {
    super();
  }

  markReportsFirstSeen(
    dto: MarkReportsFirstSeenDto,
  ): Promise<ReportResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const reportRepo = ReportRepositoryProvider(em);
      const reports = await reportRepo
        .find({
          where: {
            id: In(dto.reportIds),
          },
        })
        .then((res) => {
          if (res.length !== dto.reportIds.length) {
            const foundIds = res.map((r) => r.id);
            const missingIds = dto.reportIds.filter(
              (id) => !foundIds.includes(id),
            );
            throw new BadRequestException(
              `One or more reports not found or not accessible: ${missingIds.join(', ')}`,
            );
          }
          return res;
        });

      const firstSeenAt = new Date();
      reports.map((report) => {
        if (!report.firstSeenAt) {
          report.firstSeenAt = firstSeenAt;
        }
        if (!report.firstSeenByAdminId) {
          report.firstSeenByAdminId = dto.adminId;
        }
      });

      return reportRepo.save(reports).then((res) => res);
    }).then((res) => this.mapTo(ReportResponseDto, res));
  }

  processReport_NoActionTaken(
    dto: ProcessReport_NoActionTakenDto,
  ): Promise<ReportResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const reportRepo = ReportRepositoryProvider(em);
      const reports = await reportRepo
        .find({
          where: {
            id: In(dto.reportIds),
            status: ReportStatus.PENDING,
          },
        })
        .then((res) => {
          if (res.length !== dto.reportIds.length) {
            const foundIds = res.map((r) => r.id);
            const missingIds = dto.reportIds.filter(
              (id) => !foundIds.includes(id),
            );
            throw new BadRequestException(
              `One or more reports not found or not accessible: ${missingIds.join(', ')}`,
            );
          }
          return res;
        });

      reports.map((report) => {
        report.status = ReportStatus.CLOSED;
        report.resolutionAction = ReportResolutionActions.NO_ACTION_TAKEN;
        report.resolvedAt = new Date();
        report.resolvedById = dto.createdById;
        report.resolvedByType = ReportResolvedByType.ADMIN;
      });

      return reportRepo.save(reports).then((res) => {
        return res;
      });
    }).then((res) => this.mapTo(ReportResponseDto, res));
  }

  processReport_MaliciousReport(
    dto: ProcessReport_MaliciousReportDto,
  ): Promise<ReportResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const reportRepo = ReportRepositoryProvider(em);
      const reports = await reportRepo
        .find({
          where: {
            id: In(dto.reportIds),
            status: ReportStatus.PENDING,
          },
        })
        .then((res) => {
          if (res.length !== dto.reportIds.length) {
            const foundIds = res.map((r) => r.id);
            const missingIds = dto.reportIds.filter(
              (id) => !foundIds.includes(id),
            );
            throw new BadRequestException(
              `One or more reports not found or not accessible: ${missingIds.join(', ')}`,
            );
          }
          return res;
        });

      reports.map((report) => {
        report.status = ReportStatus.CLOSED;
        report.resolutionAction = ReportResolutionActions.MALICIOUS_REPORT;
        report.resolvedAt = new Date();
        report.resolvedById = dto.createdById;
        report.resolvedByType = ReportResolvedByType.ADMIN;
      });

      return reportRepo.save(reports).then((res) => {
        return res;
      });
    }).then((res) => this.mapTo(ReportResponseDto, res));
  }

  processReport_IssueApology(
    dto: ProcessReport_IssueApologyDto,
  ): Promise<ReportResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const reportRepo = ReportRepositoryProvider(em);
      const reports = await reportRepo
        .find({
          where: {
            id: In(dto.reportIds),
            status: ReportStatus.PENDING,
          },
        })
        .then((res) => {
          if (res.length !== dto.reportIds.length) {
            const foundIds = res.map((r) => r.id);
            const missingIds = dto.reportIds.filter(
              (id) => !foundIds.includes(id),
            );
            throw new BadRequestException(
              `One or more reports not found or not accessible: ${missingIds.join(', ')}`,
            );
          }
          return res;
        });

      reports.map((report) => {
        report.status = ReportStatus.CLOSED;
        report.resolutionAction = ReportResolutionActions.ISSUE_APOLOGY;
        report.resolvedAt = new Date();
        report.resolvedById = dto.createdById;
        report.resolvedByType = ReportResolvedByType.ADMIN;
      });

      return reportRepo.save(reports).then((res) => {
        return res;
      });
    }).then((res) => this.mapTo(ReportResponseDto, res));
  }

  processReport_BookingRefund(
    dto: ProcessReport_BookingRefundDto,
  ): Promise<ReportResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const reportRepo = ReportRepositoryProvider(em);

      const report = await reportRepo.findOneOrFail({
        where: {
          id: dto.reportId,
          status: ReportStatus.PENDING,
          targetType: ReportEntityType.BOOKING,
        },
      });

      report.status = ReportStatus.CLOSED;
      report.resolutionAction = ReportResolutionActions.REFUND_BOOKING;
      report.resolvedAt = new Date();
      report.resolvedById = dto.createdById;
      report.resolvedByType = ReportResolvedByType.ADMIN;

      return reportRepo.save(report).then(async (res) => {
        await this.locationBookingManagementService.forceRefundBooking({
          entityManager: em,
          refundPercentage: dto.refundPercentage,
          shouldCancelBooking: dto.shouldCancelBooking,
          bookingId: report.targetId,
        });
        return res;
      });
    }).then((res) => this.mapTo(ReportResponseDto, res));
  }

  processReport_TicketRefund(
    dto: ProcessReport_TicketRefundDto,
  ): Promise<ReportResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const reportRepo = ReportRepositoryProvider(em);
      const reports = await reportRepo
        .find({
          where: {
            id: In(dto.reportIds),
            status: ReportStatus.PENDING,
            targetType: ReportEntityType.EVENT,
          },
        })
        .then((res) => {
          if (res.length !== dto.reportIds.length) {
            const foundIds = res.map((r) => r.id);
            const missingIds = dto.reportIds.filter(
              (id) => !foundIds.includes(id),
            );
            throw new BadRequestException(
              `One or more reports not found or not accessible: ${missingIds.join(', ')}`,
            );
          }
          return res;
        });

      // all reports must be for the same event
      const eventId = reports[0].targetId;
      if (reports.some((report) => report.targetId !== eventId)) {
        throw new BadRequestException('All reports must be for the same event');
      }

      reports.map((report) => {
        report.status = ReportStatus.CLOSED;
        report.resolutionAction = ReportResolutionActions.REFUND_TICKET;
        report.resolvedAt = new Date();
        report.resolvedById = dto.createdById;
        report.resolvedByType = ReportResolvedByType.ADMIN;
      });

      return reportRepo.save(reports).then(async (res) => {
        await this.ticketOrderManagementService.forceIssueOrderRefund({
          entityManager: em,
          eventId: eventId,
          accountIds: reports.map((report) => report.createdById),
          refundPercentage: dto.refundPercentage,
          shouldCancelTickets: dto.shouldCancelTickets,
        });
        return res;
      });
    }).then((res) => this.mapTo(ReportResponseDto, res));
  }
}
