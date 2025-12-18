import { GetReportsByTargetTypeDto } from '@/common/dto/report/GetReportsByTargetType.dto';
import { GetMyReportsDto } from '@/common/dto/report/GetMyReports.dto';
import { GetReportByIdDto } from '@/common/dto/report/GetReportById.dto';
import { GetReportsDto } from '@/common/dto/report/GetReports.dto';
import { ReportResponseDto } from '@/common/dto/report/res/Report.response.dto';
import { PaginateConfig, Paginated } from 'nestjs-paginate';
import { ReportEntity } from '@/modules/report/domain/Report.entity';
import { PostWithReportsResponseDto } from '@/common/dto/report/res/PostWithReports.response.dto';
import { GetHighestReportedPostsDto } from '@/common/dto/report/GetHighestReportedPosts.dto';
import { EventWithReportsResponseDto } from '@/common/dto/report/res/EventWithReports.response.dto';
import { GetHighestReportedEventsDto } from '@/common/dto/report/GetHighestReportedEvents.dto';
import { LocationWithReportsResponseDto } from '@/common/dto/report/res/LocationWithReports.response.dto';
import { GetHighestReportedLocationsDto } from '@/common/dto/report/GetHighestReportedLocations.dto';
import { WithCustomPaginationDto } from '@/common/dto/WithCustomPagination.dto';

export const IReportQueryService = Symbol('IReportQueryService');

export interface IReportQueryService {
  getAllReports(dto: GetReportsDto): Promise<Paginated<ReportResponseDto>>;

  getReportsByTarget(
    dto: GetReportsByTargetTypeDto,
  ): Promise<Paginated<ReportResponseDto>>;

  getMyReports(dto: GetMyReportsDto): Promise<Paginated<ReportResponseDto>>;

  getReportById(dto: GetReportByIdDto): Promise<ReportResponseDto>;

  //

  /**
   * Gets the highest reported posts that are not processed yet.
   * @param dto
   */
  getHighestReportedPosts(
    dto: GetHighestReportedPostsDto,
  ): Promise<WithCustomPaginationDto<PostWithReportsResponseDto>>;

  /**
   * Gets the highest reported events that are not processed yet.
   * @param dto
   */
  getHighestReportedEvents(
    dto: GetHighestReportedEventsDto,
  ): Promise<WithCustomPaginationDto<EventWithReportsResponseDto>>;

  /**
   * Gets the highest reported locations that are not processed yet.
   * @param dto
   */
  getHighestReportedLocations(
    dto: GetHighestReportedLocationsDto,
  ): Promise<WithCustomPaginationDto<LocationWithReportsResponseDto>>;
}

export namespace IReportQueryService_Config {
  export function search(): PaginateConfig<ReportEntity> {
    return {
      sortableColumns: ['createdAt', 'updatedAt', 'status', 'targetType'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: ['title', 'description', 'reportedReasonKey'],
      filterableColumns: {
        status: true,
        targetType: true,
        targetId: true,
        createdById: true,
        denormSecondaryTargetId: true,
      },
      relations: {
        createdBy: true,
        reportedReasonEntity: true,
        referencedTargetPost: true,
        referencedTargetEvent: true,
        referencedTargetLocation: true,
        resolvedBy: true,
      },
      nullSort: 'last',
    };
  }
}
