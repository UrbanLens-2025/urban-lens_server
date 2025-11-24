import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IReportCreationService } from '@/modules/report/app/IReportCreation.service';
import { CoreService } from '@/common/core/Core.service';
import { CreateEventReportDto } from '@/common/dto/report/CreateEventReport.dto';
import { CreateLocationReportDto } from '@/common/dto/report/CreateLocationReport.dto';
import { CreatePostReportDto } from '@/common/dto/report/CreatePostReport.dto';
import { ReportResponseDto } from '@/common/dto/report/res/Report.response.dto';
import { ReportReasonRepositoryProvider } from '@/modules/report/infra/repository/ReportReason.repository';
import { EventRepository } from '@/modules/event/infra/repository/Event.repository';
import { LocationRepositoryProvider } from '@/modules/business/infra/repository/Location.repository';
import {
  ReportEntity,
  ReportEntityType,
} from '@/modules/report/domain/Report.entity';
import { ReportStatus } from '@/common/constants/ReportStatus.constant';
import {
  REPORT_CREATED_EVENT,
  ReportCreatedEvent,
} from '@/modules/report/domain/events/ReportCreated.event';
import { EntityManager, MoreThan } from 'typeorm';
import { PostRepositoryProvider } from '@/modules/post/infra/repository/Post.repository';
import { ReportRepositoryProvider } from '@/modules/report/infra/repository/Report.repository';

@Injectable()
export class ReportCreationService
  extends CoreService
  implements IReportCreationService
{
  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
  }

  public async createPostReport(
    dto: CreatePostReportDto,
  ): Promise<ReportResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      // Step 1: Validate post exists
      const postRepo = PostRepositoryProvider(em);
      const post = await postRepo.findOneOrFail({
        where: { postId: dto.postId },
      });

      // Step 2: Detect duplicate reports
      await this.detectReportSpamming(
        dto.createdById,
        ReportEntityType.POST,
        dto.postId,
        em,
      );

      // Step 3: Create report
      return this.createReport(
        em,
        ReportEntityType.POST,
        dto.postId,
        dto.reportedReason,
        dto.title,
        dto.description,
        dto.createdById,
        dto.attachedImageUrls,
      );
    });
  }

  public async createEventReport(
    dto: CreateEventReportDto,
  ): Promise<ReportResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      // Step 1: Validate event exists
      const eventRepo = EventRepository(em);
      const event = await eventRepo.findOneOrFail({
        where: { id: dto.eventId },
      });

      // Step 2: Detect duplicate reports
      await this.detectReportSpamming(
        dto.createdById,
        ReportEntityType.EVENT,
        dto.eventId,
        em,
      );

      // Step 3: Create report
      return this.createReport(
        em,
        ReportEntityType.EVENT,
        dto.eventId,
        dto.reportedReason,
        dto.title,
        dto.description,
        dto.createdById,
        dto.attachedImageUrls,
      );
    });
  }

  public async createLocationReport(
    dto: CreateLocationReportDto,
  ): Promise<ReportResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      // Step 1: Validate location exists
      const locationRepo = LocationRepositoryProvider(em);
      const location = await locationRepo.findOneOrFail({
        where: { id: dto.locationId },
      });

      // Step 2: Detect duplicate reports
      await this.detectReportSpamming(
        dto.createdById,
        ReportEntityType.LOCATION,
        dto.locationId,
        em,
      );

      // Step 3: Create report
      return this.createReport(
        em,
        ReportEntityType.LOCATION,
        dto.locationId,
        dto.reportedReason,
        dto.title,
        dto.description,
        dto.createdById,
        dto.attachedImageUrls,
      );
    });
  }

  private async createReport(
    em: EntityManager,
    targetType: ReportEntityType,
    targetId: string,
    reportedReason: string,
    title: string,
    description: string | undefined,
    createdById: string,
    attachedImageUrls?: string[],
  ): Promise<ReportResponseDto> {
    const reportReasonRepo = ReportReasonRepositoryProvider(em);
    const reportRepo = ReportRepositoryProvider(em);
    const reportReason = await reportReasonRepo.findOneOrFail({
      where: {
        key: reportedReason,
        isActive: true,
      },
    });

    const report = reportRepo.create({
      targetType,
      targetId,
      reportedReasonKey: reportReason.key,
      title,
      description: description ?? null,
      attachedImageUrls: attachedImageUrls || [],
      status: ReportStatus.PENDING,
      createdById,
    });

    const savedReport = await reportRepo.save(report);

    const reportCreatedEvent = new ReportCreatedEvent();
    reportCreatedEvent.reportId = savedReport.id;
    reportCreatedEvent.createdById = createdById;
    reportCreatedEvent.targetType = targetType;
    reportCreatedEvent.targetId = targetId;
    reportCreatedEvent.reportedReason = reportedReason;
    this.eventEmitter.emit(REPORT_CREATED_EVENT, reportCreatedEvent);

    return this.mapTo(ReportResponseDto, savedReport);
  }

  private async detectReportSpamming(
    accountId: string,
    targetType: ReportEntityType,
    targetId: string,
    em: EntityManager,
  ): Promise<void> {
    const reportRepo = ReportRepositoryProvider(em);
    const duplicateReportsByTargetId = await reportRepo.count({
      where: {
        createdById: accountId,
        targetType,
        targetId,
        createdAt: MoreThan(new Date(Date.now() - 1000 * 60 * 60 * 24)), // 24 hours ago
        status: ReportStatus.PENDING,
      },
    });

    if (duplicateReportsByTargetId >= 3) {
      throw new BadRequestException(
        'You have reached the maximum number of duplicate reports for this target within the last 24 hours',
      );
    }

    const totalReportsIn24Hours = await reportRepo.count({
      where: {
        createdById: accountId,
        createdAt: MoreThan(new Date(Date.now() - 1000 * 60 * 60 * 24)), // 24 hours ago
        status: ReportStatus.PENDING,
      },
    });

    if (totalReportsIn24Hours >= 10) {
      throw new BadRequestException(
        'You have reached the maximum number of reports within the last 24 hours',
      );
    }
  }
}
