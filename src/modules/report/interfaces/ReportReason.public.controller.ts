import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  IReportReasonQueryService,
  IReportReasonQueryService_Config,
} from '@/modules/report/app/IReportReasonQuery.service';
import { ApiPaginationQuery, Paginate, type PaginateQuery } from 'nestjs-paginate';

@ApiTags('Report Reason')
@Controller('/public/report-reason')
export class ReportReasonPublicController {
  constructor(
    @Inject(IReportReasonQueryService)
    private readonly reportReasonQueryService: IReportReasonQueryService,
  ) {}

  @ApiOperation({ summary: 'Get active report reasons' })
  @Get()
  @ApiPaginationQuery(IReportReasonQueryService_Config.search())
  getActiveReportReasons(@Paginate() query: PaginateQuery) {
    return this.reportReasonQueryService.getActiveReportReasons(query);
  }
}
