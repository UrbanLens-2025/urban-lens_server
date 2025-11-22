import { GetReportReasonByKeyDto } from '@/common/dto/report/GetReportReasonByKey.dto';
import { ReportReasonResponseDto } from '@/common/dto/report/res/ReportReason.response.dto';
import { ReportReasonEntity } from '@/modules/report/domain/ReportReason.entity';
import { PaginateConfig, Paginated, PaginateQuery } from 'nestjs-paginate';

export const IReportReasonQueryService = Symbol('IReportReasonQueryService');

export interface IReportReasonQueryService {
  searchReasons(
    query: PaginateQuery,
  ): Promise<Paginated<ReportReasonResponseDto>>;

  getActiveReportReasons(
    query: PaginateQuery,
  ): Promise<Paginated<ReportReasonResponseDto>>;

  getReasonByKey(
    dto: GetReportReasonByKeyDto,
  ): Promise<ReportReasonResponseDto>;
}

export namespace IReportReasonQueryService_Config {
  export function search(): PaginateConfig<ReportReasonEntity> {
    return {
      sortableColumns: ['displayName', 'createdAt', 'updatedAt'],
      defaultSortBy: [['displayName', 'ASC']],
      searchableColumns: ['key', 'displayName', 'description'],
      filterableColumns: {
        isActive: true,
      },
      nullSort: 'last',
    };
  }
}
