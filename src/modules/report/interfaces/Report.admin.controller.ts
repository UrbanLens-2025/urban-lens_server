import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
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
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { IReportProcessingService } from '@/modules/report/app/IReportProcessing.service';
import { ProcessReport_NoActionTakenDto } from '@/common/dto/report/ProcessReport_NoActionTaken.dto';
import { ProcessReport_MaliciousReportDto } from '@/common/dto/report/ProcessReport_MaliciousReport.dto';
import { ProcessReport_BookingRefundDto } from '@/common/dto/report/ProcessReport_BookingRefund.dto';
import { ProcessReport_TicketRefundDto } from '@/common/dto/report/ProcessReport_TicketRefund.dto';
import { MarkReportsFirstSeenDto } from '@/common/dto/report/MarkReportsFirstSeen.dto';
import { ProcessReport_IssueApologyDto } from '@/common/dto/report/ProcessReport_IssueApology.dto';
import { IReportAnalyticsService } from '@/modules/report/app/IReportAnalytics.service';

@ApiTags('Report')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('/admin/report')
export class ReportAdminController {
  constructor(
    @Inject(IReportQueryService)
    private readonly reportQueryService: IReportQueryService,
    @Inject(IReportProcessingService)
    private readonly reportProcessingService: IReportProcessingService,
    @Inject(IReportAnalyticsService)
    private readonly reportAnalyticsService: IReportAnalyticsService,
  ) {}

  @ApiOperation({ summary: 'Get general analytics'})
  @Get('/analytics/general')
  getGeneralAnalytics() {
    return this.reportAnalyticsService.getGeneralAnalytics();
  }

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

  @ApiOperation({ summary: 'Get highest reported post' })
  @Get('/highest-reported-posts')
  getHighestReportedPosts(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.reportQueryService.getHighestReportedPosts({
      query: {
        page,
        limit,
      },
    });
  }

  @ApiOperation({ summary: 'Get highest reported events' })
  @Get('/highest-reported-events')
  getHighestReportedEvents(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.reportQueryService.getHighestReportedEvents({
      query: {
        page,
        limit,
      },
    });
  }

  @ApiOperation({ summary: 'Get highest reported locations' })
  @Get('/highest-reported-locations')
  getHighestReportedLocations(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.reportQueryService.getHighestReportedLocations({
      query: {
        page,
        limit,
      },
    });
  }

  @ApiOperation({ summary: 'Get highest reported bookings' })
  @Get('/highest-reported-bookings')
  getHighestReportedBookings(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.reportQueryService.getHighestReportedBookings({
      query: {
        page,
        limit,
      },
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

  @ApiOperation({ summary: 'Mark reports as first seen by admin' })
  @Post('/first-seen')
  markReportsFirstSeen(
    @Body() dto: MarkReportsFirstSeenDto,
    @AuthUser() user: JwtTokenDto,
  ) {
    dto.adminId = user.sub;
    return this.reportProcessingService.markReportsFirstSeen(dto);
  }

  @ApiOperation({ summary: 'Process report - No action taken' })
  @Post('/process/no-action-taken')
  processReport_NoActionTaken(
    @Body() dto: ProcessReport_NoActionTakenDto,
    @AuthUser() user: JwtTokenDto,
  ) {
    dto.createdById = user.sub;
    return this.reportProcessingService.processReport_NoActionTaken(dto);
  }

  @ApiOperation({ summary: 'Process report - Malicious report' })
  @Post('/process/malicious-report')
  processReport_MaliciousReport(
    @Body() dto: ProcessReport_MaliciousReportDto,
    @AuthUser() user: JwtTokenDto,
  ) {
    dto.createdById = user.sub;
    return this.reportProcessingService.processReport_MaliciousReport(dto);
  }

  @ApiOperation({ summary: 'Process report - Issue apology' })
  @Post('/process/issue-apology')
  processReport_IssueApology(
    @Body() dto: ProcessReport_IssueApologyDto,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.reportProcessingService.processReport_IssueApology({
      ...dto,
      createdById: user.sub,
    });
  }

  @ApiOperation({ summary: 'Process report - Booking refund' })
  @Post('/process/booking-refund')
  processReport_BookingRefund(
    @Body() dto: ProcessReport_BookingRefundDto,
    @AuthUser() user: JwtTokenDto,
  ) {
    dto.createdById = user.sub;
    return this.reportProcessingService.processReport_BookingRefund(dto);
  }

  @ApiOperation({ summary: 'Process report - Ticket refund' })
  @Post('/process/ticket-refund')
  processReport_TicketRefund(
    @Body() dto: ProcessReport_TicketRefundDto,
    @AuthUser() user: JwtTokenDto,
  ) {
    dto.createdById = user.sub;
    return this.reportProcessingService.processReport_TicketRefund(dto);
  }
}
