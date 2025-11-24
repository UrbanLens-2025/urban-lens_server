import { GetReportsByTargetTypeDto } from '@/common/dto/report/GetReportsByTargetType.dto';
import { GetMyReportsDto } from '@/common/dto/report/GetMyReports.dto';
import { GetReportByIdDto } from '@/common/dto/report/GetReportById.dto';
import { GetReportsDto } from '@/common/dto/report/GetReports.dto';
import { ReportResponseDto } from '@/common/dto/report/res/Report.response.dto';
import { PaginateConfig, Paginated } from 'nestjs-paginate';
import { ReportEntity } from '@/modules/report/domain/Report.entity';

export const IReportQueryService = Symbol('IReportQueryService');

export interface IReportQueryService {
  getAllReports(dto: GetReportsDto): Promise<Paginated<ReportResponseDto>>;

  getReportsByTarget(
    dto: GetReportsByTargetTypeDto,
  ): Promise<Paginated<ReportResponseDto>>;

  getMyReports(dto: GetMyReportsDto): Promise<Paginated<ReportResponseDto>>;

  getReportById(dto: GetReportByIdDto): Promise<ReportResponseDto>;
}

export namespace IReportQueryService_Config {
  export function search(): PaginateConfig<ReportEntity> {
    return {
      sortableColumns: ['createdAt', 'updatedAt', 'status', 'targetType'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: ['title', 'description', 'reported_reason'],
      filterableColumns: {
        status: true,
        targetType: true,
        createdById: true,
      },
      relations: {
        createdBy: true,
        reportedReasonEntity: true,
        referencedTargetPost: true,
        referencedTargetEvent: true,
        referencedTargetLocation: true,
      },
      nullSort: 'last',
    };
  }
}
