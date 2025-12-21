import { Injectable } from '@nestjs/common';
import {
  IReportQueryService,
  IReportQueryService_Config,
} from '@/modules/report/app/IReportQuery.service';
import { GetReportsByTargetTypeDto } from '@/common/dto/report/GetReportsByTargetType.dto';
import { GetMyReportsDto } from '@/common/dto/report/GetMyReports.dto';
import { GetReportByIdDto } from '@/common/dto/report/GetReportById.dto';
import { GetReportsDto } from '@/common/dto/report/GetReports.dto';
import { ReportResponseDto } from '@/common/dto/report/res/Report.response.dto';
import { paginate, Paginated } from 'nestjs-paginate';
import { CoreService } from '@/common/core/Core.service';
import { ReportRepositoryProvider } from '@/modules/report/infra/repository/Report.repository';
import { GetHighestReportedPostsDto } from '@/common/dto/report/GetHighestReportedPosts.dto';
import { PostWithReportsResponseDto } from '@/common/dto/report/res/PostWithReports.response.dto';
import { GetHighestReportedEventsDto } from '@/common/dto/report/GetHighestReportedEvents.dto';
import { GetHighestReportedLocationsDto } from '@/common/dto/report/GetHighestReportedLocations.dto';
import { LocationWithReportsResponseDto } from '@/common/dto/report/res/LocationWithReports.response.dto';
import { EventWithReportsResponseDto } from '@/common/dto/report/res/EventWithReports.response.dto';
import { GetHighestReportedBookingsDto } from '@/common/dto/report/GetHighestReportedBookings.dto';
import { LocationBookingWithReportsResponseDto } from '@/common/dto/report/res/LocationBookingWithReports.response.dto';
import {
  ReportEntity,
  ReportEntityType,
} from '@/modules/report/domain/Report.entity';
import { PostRepositoryProvider } from '@/modules/post/infra/repository/Post.repository';
import { EventRepository } from '@/modules/event/infra/repository/Event.repository';
import { LocationRepositoryProvider } from '@/modules/business/infra/repository/Location.repository';
import { LocationBookingRepository } from '@/modules/location-booking/infra/repository/LocationBooking.repository';
import { In } from 'typeorm';
import { WithCustomPaginationDto } from '@/common/dto/WithCustomPagination.dto';

@Injectable()
export class ReportQueryService
  extends CoreService
  implements IReportQueryService
{
  constructor() {
    super();
  }

  async getAllReports(
    dto: GetReportsDto,
  ): Promise<Paginated<ReportResponseDto>> {
    const repository = ReportRepositoryProvider(this.dataSource);
    const result = await paginate(dto.query, repository, {
      ...IReportQueryService_Config.search(),
    });
    return this.mapToPaginated(ReportResponseDto, result);
  }

  async getReportsByTarget(
    dto: GetReportsByTargetTypeDto,
  ): Promise<Paginated<ReportResponseDto>> {
    const repository = ReportRepositoryProvider(this.dataSource);
    const result = await paginate(dto.query, repository, {
      ...IReportQueryService_Config.search(),
      where: {
        targetType: dto.targetType,
        targetId: dto.targetId,
      },
    });
    return this.mapToPaginated(ReportResponseDto, result);
  }

  async getMyReports(
    dto: GetMyReportsDto,
  ): Promise<Paginated<ReportResponseDto>> {
    const repository = ReportRepositoryProvider(this.dataSource);
    const result = await paginate(dto.query, repository, {
      ...IReportQueryService_Config.search(),
      where: {
        createdById: dto.userId,
      },
    });
    return this.mapToPaginated(ReportResponseDto, result);
  }

  async getReportById(dto: GetReportByIdDto): Promise<ReportResponseDto> {
    const repository = ReportRepositoryProvider(this.dataSource);
    const report = await repository.findOneOrFail({
      where: { id: dto.reportId },
      relations: {
        createdBy: true,
        reportedReasonEntity: true,
        referencedTargetPost: true,
        referencedTargetEvent: true,
        referencedTargetLocation: true,
      },
    });
    return this.mapTo(ReportResponseDto, report);
  }

  async getHighestReportedPosts(
    dto: GetHighestReportedPostsDto,
  ): Promise<WithCustomPaginationDto<PostWithReportsResponseDto>> {
    const reportRepo = ReportRepositoryProvider(this.dataSource);
    const postRepo = PostRepositoryProvider(this.dataSource);
    const targets = await reportRepo.getTargetsWithHighestUnclosedReports({
      targetType: ReportEntityType.POST,
      limit: dto.query.limit,
      page: dto.query.page,
    });

    const targetIds = targets.data?.map((target) => target.target_id);

    if (!targetIds || targetIds.length === 0) {
      return {
        data: [],
        count: 0,
        page: dto.query.page,
        limit: dto.query.limit,
      } as unknown as WithCustomPaginationDto<PostWithReportsResponseDto>;
    }

    const posts = await postRepo.find({
      where: {
        postId: In(targetIds),
      },
    });

    const reports = await reportRepo.find({
      where: {
        targetId: In(targetIds),
      },
    });

    // make a map of targetId to reports
    const reportsMap = new Map<string, ReportEntity[]>();
    reports.forEach((report) => {
      reportsMap.set(report.targetId, [
        ...(reportsMap.get(report.targetId) || []),
        report,
      ]);
    });

    // map to PostWithReportsResponseDto
    const result = posts.map((post) => {
      return {
        ...post,
        reports: reportsMap.get(post.postId) || [],
      };
    });

    const data = this.mapToArray(PostWithReportsResponseDto, result);
    return {
      data,
      count: targets.count,
      page: dto.query.page,
      limit: dto.query.limit,
    } as unknown as WithCustomPaginationDto<PostWithReportsResponseDto>;
  }

  async getHighestReportedEvents(
    dto: GetHighestReportedEventsDto,
  ): Promise<WithCustomPaginationDto<EventWithReportsResponseDto>> {
    const reportRepo = ReportRepositoryProvider(this.dataSource);
    const eventRepo = EventRepository(this.dataSource);
    const targets = await reportRepo.getTargetsWithHighestUnclosedReports({
      targetType: ReportEntityType.EVENT,
      limit: dto.query.limit,
      page: dto.query.page,
    });

    const events = await eventRepo.find({
      where: {
        id: In(targets.data.map((target) => target.target_id)),
      },
    });

    const reports = await reportRepo.find({
      where: {
        targetId: In(targets.data.map((target) => target.target_id)),
      },
    });

    // make a map of targetId to reports
    const reportsMap = new Map<string, ReportEntity[]>();
    reports.forEach((report) => {
      reportsMap.set(report.targetId, [
        ...(reportsMap.get(report.targetId) || []),
        report,
      ]);
    });

    // map to EventWithReportsResponseDto
    const result = events.map((event) => {
      return {
        ...event,
        reports: reportsMap.get(event.id) || [],
      };
    });

    const data = this.mapToArray(EventWithReportsResponseDto, result);
    return {
      data,
      count: targets.count,
      page: dto.query.page,
      limit: dto.query.limit,
    } as unknown as WithCustomPaginationDto<EventWithReportsResponseDto>;
  }

  async getHighestReportedLocations(
    dto: GetHighestReportedLocationsDto,
  ): Promise<WithCustomPaginationDto<LocationWithReportsResponseDto>> {
    const reportRepo = ReportRepositoryProvider(this.dataSource);
    const locationRepo = LocationRepositoryProvider(this.dataSource);
    const targets = await reportRepo.getTargetsWithHighestUnclosedReports({
      targetType: ReportEntityType.LOCATION,
      limit: dto.query.limit,
      page: dto.query.page,
    });

    const targetIds = targets.data?.map((target) => target.target_id);

    if (!targetIds || targetIds.length === 0) {
      return {
        data: [],
        count: 0,
        page: dto.query.page,
        limit: dto.query.limit,
      } as unknown as WithCustomPaginationDto<LocationWithReportsResponseDto>;
    }

    const locations = await locationRepo.find({
      where: {
        id: In(targetIds),
      },
    });

    const reports = await reportRepo.find({
      where: {
        targetId: In(targetIds),
      },
    });

    // make a map of targetId to reports
    const reportsMap = new Map<string, ReportEntity[]>();
    reports.forEach((report) => {
      reportsMap.set(report.targetId, [
        ...(reportsMap.get(report.targetId) || []),
        report,
      ]);
    });

    // map to LocationWithReportsResponseDto
    const result = locations.map((location) => {
      return {
        ...location,
        reports: reportsMap.get(location.id) || [],
      };
    });

    const data = this.mapToArray(LocationWithReportsResponseDto, result);
    return {
      data,
      count: targets.count,
      page: dto.query.page,
      limit: dto.query.limit,
    } as unknown as WithCustomPaginationDto<LocationWithReportsResponseDto>;
  }

  async getHighestReportedBookings(
    dto: GetHighestReportedBookingsDto,
  ): Promise<WithCustomPaginationDto<LocationBookingWithReportsResponseDto>> {
    const reportRepo = ReportRepositoryProvider(this.dataSource);
    const locationBookingRepo = LocationBookingRepository(this.dataSource);
    const targets = await reportRepo.getTargetsWithHighestUnclosedReports({
      targetType: ReportEntityType.BOOKING,
      limit: dto.query.limit,
      page: dto.query.page,
    });

    const targetIds = targets.data?.map((target) => target.target_id);

    if (!targetIds || targetIds.length === 0) {
      return {
        data: [],
        count: 0,
        page: dto.query.page,
        limit: dto.query.limit,
      } as unknown as WithCustomPaginationDto<LocationBookingWithReportsResponseDto>;
    }

    const bookings = await locationBookingRepo.find({
      where: {
        id: In(targetIds),
      },
      relations: {
        location: true,
        dates: false,
      },
      loadEagerRelations: false,
    });

    const reports = await reportRepo.find({
      where: {
        targetId: In(targetIds),
      },
    });

    // make a map of targetId to reports
    const reportsMap = new Map<string, ReportEntity[]>();
    reports.forEach((report) => {
      reportsMap.set(report.targetId, [
        ...(reportsMap.get(report.targetId) || []),
        report,
      ]);
    });

    // map to LocationBookingWithReportsResponseDto
    const result = bookings.map((booking) => {
      return {
        ...booking,
        reports: reportsMap.get(booking.id) || [],
      };
    });

    const data = this.mapToArray(LocationBookingWithReportsResponseDto, result);
    return {
      data,
      count: targets.count,
      page: dto.query.page,
      limit: dto.query.limit,
    } as unknown as WithCustomPaginationDto<LocationBookingWithReportsResponseDto>;
  }
}
