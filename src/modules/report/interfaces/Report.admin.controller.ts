import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import {
  IReportQueryService,
  IReportQueryService_Config,
} from '@/modules/report/app/IReportQuery.service';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';
import { GetReportsByTargetTypeDto } from '@/common/dto/report/GetReportsByTargetType.dto';
import { GetReportsDto } from '@/common/dto/report/GetReports.dto';

@ApiTags('Report')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('/admin/report')
export class ReportAdminController {
  constructor(
    @Inject(IReportQueryService)
    private readonly reportQueryService: IReportQueryService,
  ) {}

  @ApiOperation({ summary: 'Get all reports' })
  @ApiPaginationQuery(IReportQueryService_Config.search())
  @Get()
  getAllReports(@Paginate() query: PaginateQuery) {
    const dto: GetReportsDto = { query };
    return this.reportQueryService.getAllReports(dto);
  }

  @ApiOperation({ summary: 'Get reports by target entity' })
  @ApiPaginationQuery(IReportQueryService_Config.search())
  @Get('/target')
  getReportsByTarget(
    @Query() dto: GetReportsByTargetTypeDto,
    @Paginate() query: PaginateQuery,
  ) {
    return this.reportQueryService.getReportsByTarget({
      ...dto,
      query,
    });
  }

  @ApiOperation({ summary: 'Get report by ID' })
  @Get('/:reportId')
  @ApiParam({
    name: 'reportId',
    description: 'Report identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  getReportById(@Param('reportId') reportId: string) {
    return this.reportQueryService.getReportById({ reportId });
  }
}
