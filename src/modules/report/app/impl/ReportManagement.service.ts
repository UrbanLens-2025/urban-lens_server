import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { IReportManagementService } from '@/modules/report/app/IReportManagement.service';
import { ProcessReportDto } from '@/common/dto/report/ProcessReport.dto';
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
import { _ } from 'ollama/dist/shared/ollama.27169772.cjs';
import dayjs from 'dayjs';
import { ILocationSuspensionService } from '@/modules/business/app/ILocationSuspension.service';
import { ITicketOrderManagementService } from '@/modules/event/app/ITicketOrderManagement.service';
import { ILocationBookingManagementService } from '@/modules/location-booking/app/ILocationBookingManagement.service';

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

      return reportRepo.save(report).then(async (res) => {
        await this.handleReportResolution(em, report, dto.resolutionAction);
        await this.handlePenaltyAction(em, report, dto.penaltyAction);
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
  ) {
    switch (resolutionAction) {
      case ReportResolutionActions.CANCEL_EVENT:
        this.logger.log(`Cancelling event: ${report.targetId}`);
        break;
      case ReportResolutionActions.SUSPEND_EVENT:
        this.logger.log(`Suspending event: ${report.targetId}`);
        break;
      case ReportResolutionActions.NO_ACTION_TAKEN:
        this.logger.log('No action taken');
        break;
      case ReportResolutionActions.MALICIOUS_REPORT:
        this.logger.log('Malicious report');
        break;
      case ReportResolutionActions.PARTIAL_TICKET_REFUND:
        this.logger.log('Partial ticket refund');
        await this.ticketOrderManagementService.forceRefundOrder({
          entityManager: em,
          eventId: report.targetId,
          accountId: report.createdById,
          refundPercentage: 0.1, // TODO
          refundReason: 'Reported as malicious',
          shouldCancelTickets: false, // TODO
        });
        break;
      case ReportResolutionActions.FULL_TICKET_REFUND:
        this.logger.log('Full ticket refund');
        await this.ticketOrderManagementService.forceRefundOrder({
          entityManager: em,
          eventId: report.targetId,
          accountId: report.createdById,
          refundPercentage: 1,
          refundReason: 'Reported as malicious', // TODO
          shouldCancelTickets: false, // TODO
        });
        break;
      case ReportResolutionActions.PARTIAL_BOOKING_REFUND:
        this.logger.log('Partial booking refund');
        await this.locationBookingManagementService.forceRefundBooking({
          accountId: report.createdById,
          locationId: report.targetId,
          entityManager: em,
          refundPercentage: 0.1,
          shouldCancelBooking: false, // TODO
        });
        break;
      case ReportResolutionActions.FULL_BOOKING_REFUND:
        this.logger.log('Full booking refund');
        await this.locationBookingManagementService.forceRefundBooking({
          accountId: report.createdById,
          locationId: report.targetId,
          entityManager: em,
          refundPercentage: 1,
          shouldCancelBooking: false, // TODO
        });
        break;
      case ReportResolutionActions.BAN_POST: {
        this.logger.log(`Banning post: ${report.targetId}`);
        const reason = ''; // todo
        await this.postService.banPost(report.targetId, reason);
        break;
      }
    }
  }

  private async handlePenaltyAction(
    em: EntityManager,
    report: ReportEntity,
    penaltyAction: ReportPenaltyActions,
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
        const targetId = await this.getTargetAccountId(report, em);
        await this.accountWarningService.sendWarning({
          accountId: targetId,
          warningNote: 'Warning for reporting malicious content',
          entityManager: em,
        });
        break;
      }
      case ReportPenaltyActions.SUSPEND_ACCOUNT: {
        this.logger.log('Suspend account penalty');
        const targetId = await this.getTargetAccountId(report, em);
        await this.accountWarningService.suspendAccount({
          targetId,
          accountId: report.resolvedById ?? null,
          suspendUntil: new Date(),
          suspensionReason: '',
        });
        break;
      }
      case ReportPenaltyActions.BAN_ACCOUNT: {
        this.logger.log('Ban account penalty');
        const targetId = await this.getTargetAccountId(report, em);
        await this.accountWarningService.suspendAccount({
          targetId,
          accountId: report.resolvedById ?? null,
          suspendUntil: dayjs().add(999, 'years').toDate(),
          suspensionReason: '',
        });
        break;
      }
      case ReportPenaltyActions.SUSPEND_LOCATION_BOOKING:
        this.logger.log('Suspend location booking penalty');
        await this.locationSuspensionService.suspendLocationBooking({
          entityManager: em,
          accountId: report.resolvedById,
          suspendedUntil: dayjs().add(999, 'years').toDate(), // TODO
          suspensionReason: '',
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
