import { Body, Controller, Get, Inject, Param, Post, Query } from '@nestjs/common';
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
import { ProcessReportDto } from '@/common/dto/report/ProcessReport.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { IReportManagementService } from '@/modules/report/app/IReportManagement.service';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';

@ApiTags('Report')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('/admin/report')
export class ReportAdminController {
  constructor(
    @Inject(IReportQueryService)
    private readonly reportQueryService: IReportQueryService,
    @Inject(IReportManagementService)
    private readonly reportManagementService: IReportManagementService,
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

  @ApiOperation({ summary: 'Process report' })
  @Post('/:reportId/process')
  processReport(
    @Param('reportId') reportId: string,
    @Body() dto: ProcessReportDto,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.reportManagementService.processReport({
      ...dto,
      reportId,
      initiatedByAccountId: user.sub,
    });
  }
}
