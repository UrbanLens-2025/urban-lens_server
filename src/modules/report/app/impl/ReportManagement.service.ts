import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { IReportManagementService } from '@/modules/report/app/IReportManagement.service';
import {
  CommonPenaltyPayloadDto,
  CommonResolutionPayloadDto,
  ProcessReportDto,
  ResolutionPayloadDto,
} from '@/common/dto/report/ProcessReport.dto';
import { ReportResponseDto } from '@/common/dto/report/res/Report.response.dto';
import { CoreService } from '@/common/core/Core.service';
import { ReportRepositoryProvider } from '@/modules/report/infra/repository/Report.repository';
import { ReportPenaltyActions } from '@/common/constants/ReportPenaltyActions.constant';
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
import { IAccountWarningService } from '@/modules/account/app/IAccountWarning.service';
import { PostRepositoryProvider } from '@/modules/post/infra/repository/Post.repository';
import { LocationRepositoryProvider } from '@/modules/business/infra/repository/Location.repository';
import { EventRepository } from '@/modules/event/infra/repository/Event.repository';
import dayjs from 'dayjs';
import { ILocationSuspensionService } from '@/modules/business/app/ILocationSuspension.service';
import { ITicketOrderManagementService } from '@/modules/event/app/ITicketOrderManagement.service';
import { ILocationBookingManagementService } from '@/modules/location-booking/app/ILocationBookingManagement.service';
import { isNotBlank } from '@/common/utils/is-not-blank.util';

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
    @Inject(IAccountWarningService)
    private readonly accountWarningService: IAccountWarningService,
    @Inject(ILocationSuspensionService)
    private readonly locationSuspensionService: ILocationSuspensionService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
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
      report.penaltyAction = dto.penaltyAction;
      report.resolvedByType = dto.initiatedByAccountId
        ? ReportResolvedByType.ADMIN
        : ReportResolvedByType.SYSTEM;
      report.resolvedAt = new Date();
      report.status = ReportStatus.CLOSED;

      if (report.resolvedByType === ReportResolvedByType.ADMIN) {
        report.resolvedById = dto.initiatedByAccountId;
      }

      return reportRepo
        .save(report)
        .then(async (res) => {
          await this.handleReportResolution(
            em,
            res,
            dto.resolutionAction,
            dto.resolutionPayload,
          );

          return res;
        })
        .then(async (res) => {
          await this.handlePenaltyAction(
            em,
            res,
            dto.penaltyAction,
            dto.penaltyPayload,
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

  private async handleReportResolution(
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
      case ReportResolutionActions.PARTIAL_TICKET_REFUND:
        this.logger.log('Partial ticket refund');
        if (!isNotBlank(resolutionPayload.refundPercentage)) {
          throw new BadRequestException(
            'Refund percentage is required for PARTIAL_TICKET_REFUND',
          );
        }
        if (!isNotBlank(resolutionPayload.shouldCancelTickets)) {
          throw new BadRequestException(
            'Should cancel tickets is required for PARTIAL_TICKET_REFUND',
          );
        }
        if (!isNotBlank(resolutionPayload.reason)) {
          throw new BadRequestException(
            'Reason is required for PARTIAL_TICKET_REFUND',
          );
        }
        await this.ticketOrderManagementService.forceRefundOrder({
          entityManager: em,
          eventId: report.targetId,
          accountId: report.createdById,
          refundPercentage: resolutionPayload.refundPercentage,
          refundReason: resolutionPayload.reason,
          shouldCancelTickets: resolutionPayload.shouldCancelTickets,
        });
        break;
      case ReportResolutionActions.FULL_TICKET_REFUND:
        this.logger.log('Full ticket refund');
        if (!isNotBlank(resolutionPayload.shouldCancelTickets)) {
          throw new BadRequestException(
            'Should cancel tickets is required for FULL_TICKET_REFUND',
          );
        }
        if (!isNotBlank(resolutionPayload.reason)) {
          throw new BadRequestException(
            'Reason is required for FULL_TICKET_REFUND',
          );
        }
        await this.ticketOrderManagementService.forceRefundOrder({
          entityManager: em,
          eventId: report.targetId,
          accountId: report.createdById,
          refundPercentage: 1,
          refundReason: resolutionPayload.reason,
          shouldCancelTickets: resolutionPayload.shouldCancelTickets,
        });
        break;
      case ReportResolutionActions.PARTIAL_BOOKING_REFUND:
        this.logger.log('Partial booking refund');
        if (!isNotBlank(resolutionPayload.refundPercentage)) {
          throw new BadRequestException(
            'Refund percentage is required for PARTIAL_BOOKING_REFUND',
          );
        }
        if (!isNotBlank(resolutionPayload.shouldCancelBooking)) {
          throw new BadRequestException(
            'Should cancel booking is required for PARTIAL_BOOKING_REFUND',
          );
        }
        await this.locationBookingManagementService.forceRefundBooking({
          accountId: report.createdById,
          locationId: report.targetId,
          entityManager: em,
          refundPercentage: resolutionPayload.refundPercentage,
          shouldCancelBooking: resolutionPayload.shouldCancelBooking,
        });
        break;
      case ReportResolutionActions.FULL_BOOKING_REFUND:
        this.logger.log('Full booking refund');
        if (!isNotBlank(resolutionPayload.shouldCancelBooking)) {
          throw new BadRequestException(
            'Should cancel booking is required for FULL_BOOKING_REFUND',
          );
        }
        await this.locationBookingManagementService.forceRefundBooking({
          accountId: report.createdById,
          locationId: report.targetId,
          entityManager: em,
          refundPercentage: 1,
          shouldCancelBooking: resolutionPayload.shouldCancelBooking,
        });
        break;
      case ReportResolutionActions.BAN_POST: {
        this.logger.log(`Banning post: ${report.targetId}`);
        if (!isNotBlank(resolutionPayload.reason)) {
          throw new BadRequestException('Reason is required for BAN_POST');
        }
        await this.postService.banPost(
          report.targetId,
          resolutionPayload.reason,
        );
        break;
      }
    }
  }

  private async handlePenaltyAction(
    em: EntityManager,
    report: ReportEntity,
    penaltyAction: ReportPenaltyActions,
    penaltyPayload: CommonPenaltyPayloadDto,
  ): Promise<void> {
    this.logger.log(`Processing penalty action: ${penaltyAction}`);
    this.logger.log(
      `Report ID: ${report.id}, Target Type: ${report.targetType}, Target ID: ${report.targetId}`,
    );

    switch (penaltyAction) {
      case ReportPenaltyActions.NO_PENALTY:
        this.logger.log('No penalty applied');
        break;
      case ReportPenaltyActions.WARN_USER: {
        this.logger.log('Warn user penalty');
        if (!isNotBlank(penaltyPayload.reason)) {
          throw new BadRequestException('Reason is required for WARN_USER');
        }
        const targetId = await this.getTargetAccountId(report, em);
        await this.accountWarningService.sendWarning({
          accountId: targetId,
          warningNote: penaltyPayload.reason,
          entityManager: em,
        });
        break;
      }
      case ReportPenaltyActions.SUSPEND_ACCOUNT: {
        this.logger.log('Suspend account penalty');
        if (!isNotBlank(penaltyPayload.suspendUntil)) {
          throw new BadRequestException(
            'Suspend until is required for SUSPEND_ACCOUNT',
          );
        }
        if (!isNotBlank(penaltyPayload.reason)) {
          throw new BadRequestException(
            'Reason is required for SUSPEND_ACCOUNT',
          );
        }
        const targetId = await this.getTargetAccountId(report, em);
        await this.accountWarningService.suspendAccount({
          targetId,
          accountId: report.resolvedById ?? null,
          suspendUntil: penaltyPayload.suspendUntil,
          suspensionReason: penaltyPayload.reason,
        });
        break;
      }
      case ReportPenaltyActions.BAN_ACCOUNT: {
        this.logger.log('Ban account penalty');
        if (!isNotBlank(penaltyPayload.reason)) {
          throw new BadRequestException('Reason is required for BAN_ACCOUNT');
        }
        const targetId = await this.getTargetAccountId(report, em);
        await this.accountWarningService.suspendAccount({
          targetId,
          accountId: report.resolvedById ?? null,
          suspendUntil: dayjs().add(999, 'years').toDate(),
          suspensionReason: penaltyPayload.reason,
        });
        break;
      }
      case ReportPenaltyActions.SUSPEND_LOCATION_BOOKING:
        this.logger.log('Suspend location booking penalty');
        if (!isNotBlank(penaltyPayload.suspendUntil)) {
          throw new BadRequestException(
            'Suspend until is required for SUSPEND_LOCATION_BOOKING',
          );
        }
        if (!isNotBlank(penaltyPayload.reason)) {
          throw new BadRequestException(
            'Reason is required for SUSPEND_LOCATION_BOOKING',
          );
        }
        await this.locationSuspensionService.suspendLocationBooking({
          entityManager: em,
          accountId: report.resolvedById,
          suspendedUntil: penaltyPayload.suspendUntil,
          suspensionReason: penaltyPayload.reason,
          locationBookingId: report.targetId,
        });
        break;
    }
  }

  private async getTargetAccountId(
    report: ReportEntity,
    em: EntityManager,
  ): Promise<string> {
    switch (report.targetType) {
      case ReportEntityType.POST: {
        const postRepo = PostRepositoryProvider(em);
        const post = await postRepo.findOneOrFail({
          where: { postId: report.targetId },
        });
        return post.authorId;
      }
      case ReportEntityType.LOCATION: {
        const locationRepo = LocationRepositoryProvider(em);
        const location = await locationRepo.findOneOrFail({
          where: { id: report.targetId },
        });
        return location.businessId;
      }
      case ReportEntityType.EVENT: {
        const eventRepo = EventRepository(em);
        const event = await eventRepo.findOneOrFail({
          where: { id: report.targetId },
        });
        return event.createdById;
      }
      default: {
        this.logger.error(
          `Unknown target type for report: ${report.targetType as unknown as string}`,
        );
        throw new InternalServerErrorException(
          'Unknown target type for report',
        );
      }
    }
  }
}
