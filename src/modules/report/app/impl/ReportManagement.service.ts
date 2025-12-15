import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IReportManagementService } from '@/modules/report/app/IReportManagement.service';
import {
  CommonResolutionPayloadDto,
  ProcessReportDto,
} from '@/common/dto/report/ProcessReport.dto';
import { ReportResponseDto } from '@/common/dto/report/res/Report.response.dto';
import { CoreService } from '@/common/core/Core.service';
import { ReportRepositoryProvider } from '@/modules/report/infra/repository/Report.repository';
import { ReportResolvedByType } from '@/common/constants/ReportResolvedByType.constant';
import { ReportResolutionActions } from '@/common/constants/ReportResolutionActions.constant';
import {
  ReportEntity,
  ReportEntityType,
} from '@/modules/report/domain/Report.entity';
import { ReportStatus } from '@/common/constants/ReportStatus.constant';
import { IEventManagementService } from '@/modules/event/app/IEventManagement.service';
import { EntityManager } from 'typeorm';
import { IPostService } from '@/modules/post/app/IPost.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  REPORT_RESOLVED_EVENT,
  ReportResolvedEvent,
} from '@/modules/report/domain/events/ReportResolved.event';
import { ITicketOrderManagementService } from '@/modules/event/app/ITicketOrderManagement.service';
import { ILocationBookingManagementService } from '@/modules/location-booking/app/ILocationBookingManagement.service';
import { isNotBlank } from '@/common/utils/is-not-blank.util';
import { ProcessReportV2Dto } from '@/common/dto/report/ProcessReportV2.dto';

@Injectable()
export class ReportManagementService
  extends CoreService
  implements IReportManagementService
{
  private readonly logger = this.getLogger(ReportManagementService.name);

  constructor(
    @Inject(IEventManagementService)
    private readonly eventManagementService: IEventManagementService,
    @Inject(ILocationBookingManagementService)
    private readonly locationBookingManagementService: ILocationBookingManagementService,
    @Inject(ITicketOrderManagementService)
    private readonly ticketOrderManagementService: ITicketOrderManagementService,
    @Inject(IPostService)
    private readonly postService: IPostService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  processReportV2(dto: ProcessReportV2Dto): Promise<ReportResponseDto> {
    return this.ensureTransaction(null, async (em) => {}).then((res) =>
      this.mapTo(ReportResponseDto, res),
    );
  }

  processReport(dto: ProcessReportDto): Promise<ReportResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const reportRepo = ReportRepositoryProvider(em);
      const report = await reportRepo
        .findOneOrFail({
          where: { id: dto.reportId },
        })
        .then((res) => {
          if (!res.canBeProcessed()) {
            throw new BadRequestException(
              'Report must be pending to be processed',
            );
          }
          return res;
        });

      report.resolutionAction = dto.resolutionAction;
      report.resolvedByType = dto.initiatedByAccountId
        ? ReportResolvedByType.ADMIN
        : ReportResolvedByType.SYSTEM;
      report.resolvedAt = new Date();
      report.status = ReportStatus.CLOSED;

      if (report.resolvedByType === ReportResolvedByType.ADMIN) {
        report.resolvedById = dto.initiatedByAccountId;
      }

      return reportRepo.save(report).then((res) => {
        this.handleReportResolution(
          em,
          res,
          dto.resolutionAction,
          dto.resolutionPayload,
        );

        return res;
      });
    })
      .then((res) => {
        this.eventEmitter.emit(
          REPORT_RESOLVED_EVENT,
          new ReportResolvedEvent(res.id),
        );
        return res;
      })
      .then((res) => this.mapTo(ReportResponseDto, res));
  }

  private handleReportResolution(
    em: EntityManager,
    report: ReportEntity,
    resolutionAction: ReportResolutionActions,
    resolutionPayload: CommonResolutionPayloadDto,
  ) {
    switch (resolutionAction) {
      case ReportResolutionActions.NO_ACTION_TAKEN: {
        this.logger.log('No action taken');
        if (!isNotBlank(resolutionPayload.reason)) {
          throw new BadRequestException(
            'Reason is required for NO_ACTION_TAKEN',
          );
        }
        break;
      }
      case ReportResolutionActions.MALICIOUS_REPORT: {
        this.logger.log('Malicious report');
        if (!isNotBlank(resolutionPayload.reason)) {
          throw new BadRequestException(
            'Reason is required for MALICIOUS_REPORT',
          );
        }
        break;
      }
      // case ReportResolutionActions.PARTIAL_TICKET_REFUND:
      //   this.validateTargetType(report, ReportEntityType.EVENT);
      //   this.logger.log('Partial ticket refund');
      //   if (!isNotBlank(resolutionPayload.refundPercentage)) {
      //     throw new BadRequestException(
      //       'Refund percentage is required for PARTIAL_TICKET_REFUND',
      //     );
      //   }
      //   if (!isNotBlank(resolutionPayload.shouldCancelTickets)) {
      //     throw new BadRequestException(
      //       'Should cancel tickets is required for PARTIAL_TICKET_REFUND',
      //     );
      //   }
      //   if (!isNotBlank(resolutionPayload.reason)) {
      //     throw new BadRequestException(
      //       'Reason is required for PARTIAL_TICKET_REFUND',
      //     );
      //   }
      //   await this.ticketOrderManagementService.forceRefundOrder({
      //     entityManager: em,
      //     eventId: report.targetId,
      //     accountId: report.createdById,
      //     refundPercentage: resolutionPayload.refundPercentage,
      //     refundReason: resolutionPayload.reason,
      //     shouldCancelTickets: resolutionPayload.shouldCancelTickets,
      //   });
      //   break;
      // case ReportResolutionActions.FULL_TICKET_REFUND:
      //   this.validateTargetType(report, ReportEntityType.EVENT);
      //   this.logger.log('Full ticket refund');
      //   if (!isNotBlank(resolutionPayload.shouldCancelTickets)) {
      //     throw new BadRequestException(
      //       'Should cancel tickets is required for FULL_TICKET_REFUND',
      //     );
      //   }
      //   if (!isNotBlank(resolutionPayload.reason)) {
      //     throw new BadRequestException(
      //       'Reason is required for FULL_TICKET_REFUND',
      //     );
      //   }
      //   await this.ticketOrderManagementService.forceRefundOrder({
      //     entityManager: em,
      //     eventId: report.targetId,
      //     accountId: report.createdById,
      //     refundPercentage: 1,
      //     refundReason: resolutionPayload.reason,
      //     shouldCancelTickets: resolutionPayload.shouldCancelTickets,
      //   });
      //   break;
      // case ReportResolutionActions.PARTIAL_BOOKING_REFUND:
      //   this.validateTargetType(report, ReportEntityType.LOCATION);
      //   this.logger.log('Partial booking refund');
      //   if (!isNotBlank(resolutionPayload.refundPercentage)) {
      //     throw new BadRequestException(
      //       'Refund percentage is required for PARTIAL_BOOKING_REFUND',
      //     );
      //   }
      //   if (!isNotBlank(resolutionPayload.shouldCancelBooking)) {
      //     throw new BadRequestException(
      //       'Should cancel booking is required for PARTIAL_BOOKING_REFUND',
      //     );
      //   }
      //   await this.locationBookingManagementService.forceRefundBooking({
      //     accountId: report.createdById,
      //     locationId: report.targetId,
      //     entityManager: em,
      //     refundPercentage: resolutionPayload.refundPercentage,
      //     shouldCancelBooking: resolutionPayload.shouldCancelBooking,
      //   });
      //   break;
      // case ReportResolutionActions.FULL_BOOKING_REFUND:
      //   this.validateTargetType(report, ReportEntityType.LOCATION);
      //   this.logger.log('Full booking refund');
      //   if (!isNotBlank(resolutionPayload.shouldCancelBooking)) {
      //     throw new BadRequestException(
      //       'Should cancel booking is required for FULL_BOOKING_REFUND',
      //     );
      //   }
      //   await this.locationBookingManagementService.forceRefundBooking({
      //     accountId: report.createdById,
      //     locationId: report.targetId,
      //     entityManager: em,
      //     refundPercentage: 1,
      //     shouldCancelBooking: resolutionPayload.shouldCancelBooking,
      //   });
      //   break;
      // case ReportResolutionActions.BAN_POST: {
      //   this.validateTargetType(report, ReportEntityType.POST);
      //   this.logger.log(`Banning post: ${report.targetId}`);
      //   if (!isNotBlank(resolutionPayload.reason)) {
      //     throw new BadRequestException('Reason is required for BAN_POST');
      //   }
      //   await this.postService.banPost(
      //     report.targetId,
      //     resolutionPayload.reason,
      //     em,
      //   );
      //   break;
      // }
    }
  }

  private validateTargetType(
    report: ReportEntity,
    expectedType: ReportEntityType,
  ): void {
    if (report.targetType !== expectedType) {
      throw new BadRequestException(
        `This action can only be applied to ${expectedType} reports, but this report targets ${report.targetType}`,
      );
    }
  }
}
