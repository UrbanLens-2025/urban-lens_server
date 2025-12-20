import { Controller, Get, Inject } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { IDashboardService } from '@/modules/dashboard/app/IDashboard.service';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { EventCreatorDashboardStatsResponseDto } from '@/common/dto/dashboard/EventCreatorDashboardStats.response.dto';
import { GetEventCreatorRevenueQueryDto } from '@/common/dto/dashboard/GetEventCreatorRevenue.query.dto';
import {
  EventCreatorRevenueByDayDto,
  EventCreatorRevenueByMonthDto,
  EventCreatorRevenueByYearDto,
} from '@/common/dto/dashboard/EventCreatorRevenue.response.dto';
import { GetEventCreatorPerformanceQueryDto } from '@/common/dto/dashboard/GetEventCreatorPerformance.query.dto';
import {
  EventCreatorPerformanceByDayDto,
  EventCreatorPerformanceByMonthDto,
  EventCreatorPerformanceByYearDto,
} from '@/common/dto/dashboard/EventCreatorPerformance.response.dto';
import { Query } from '@nestjs/common';
import { RevenueSummaryResponseDto } from '@/common/dto/dashboard/RevenueSummary.response.dto';
import { TopEventByRevenueDto } from '@/common/dto/dashboard/TopEventsByRevenue.response.dto';
import { ApiQuery } from '@nestjs/swagger';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Roles(Role.EVENT_CREATOR)
@Controller('/creator/dashboard')
export class DashboardCreatorController {
  constructor(
    @Inject(IDashboardService)
    private readonly dashboardService: IDashboardService,
  ) {}

  @ApiOperation({
    summary: 'Get event creator dashboard statistics',
    description:
      'Get dashboard statistics for event creator including total events, active events, upcoming events, draft events, percentage change, and revenue.',
  })
  @ApiResponse({
    status: 200,
    description: 'Event creator dashboard stats',
    type: EventCreatorDashboardStatsResponseDto,
  })
  @Get('/stats')
  getEventCreatorDashboardStats(
    @AuthUser() user: JwtTokenDto,
  ): Promise<EventCreatorDashboardStatsResponseDto> {
    return this.dashboardService.getEventCreatorDashboardStats(user.sub);
  }

  @ApiOperation({
    summary: 'Get event creator revenue overview',
    description:
      'Get event creator revenue from paid ticket orders. Returns array based on filter: day -> revenue by day (last 7 days), month -> revenue by month (12 months in current year), year -> revenue by year (all years).',
  })
  @ApiResponse({
    status: 200,
    description: 'Event creator revenue by day (when filter=day)',
    type: [EventCreatorRevenueByDayDto],
  })
  @ApiResponse({
    status: 200,
    description: 'Event creator revenue by month (when filter=month)',
    type: [EventCreatorRevenueByMonthDto],
  })
  @ApiResponse({
    status: 200,
    description: 'Event creator revenue by year (when filter=year)',
    type: [EventCreatorRevenueByYearDto],
  })
  @Get('/revenue/overview')
  getEventCreatorRevenueOverview(
    @AuthUser() user: JwtTokenDto,
    @Query() query: GetEventCreatorRevenueQueryDto,
  ): Promise<
    | EventCreatorRevenueByDayDto[]
    | EventCreatorRevenueByMonthDto[]
    | EventCreatorRevenueByYearDto[]
  > {
    return this.dashboardService.getEventCreatorRevenueOverview(
      user.sub,
      query,
    );
  }

  @ApiOperation({
    summary: 'Get event creator performance timeline',
    description:
      'Get event performance timeline showing event lifecycle over time. Returns array based on filter: day -> performance by day (last 7 days), month -> performance by month (12 months in current year), year -> performance by year (all years). Shows count of events by status: draft, published, finished.',
  })
  @ApiResponse({
    status: 200,
    description: 'Event creator performance by day (when filter=day)',
    type: [EventCreatorPerformanceByDayDto],
  })
  @ApiResponse({
    status: 200,
    description: 'Event creator performance by month (when filter=month)',
    type: [EventCreatorPerformanceByMonthDto],
  })
  @ApiResponse({
    status: 200,
    description: 'Event creator performance by year (when filter=year)',
    type: [EventCreatorPerformanceByYearDto],
  })
  @Get('/performance')
  getEventCreatorPerformance(
    @AuthUser() user: JwtTokenDto,
    @Query() query: GetEventCreatorPerformanceQueryDto,
  ): Promise<
    | EventCreatorPerformanceByDayDto[]
    | EventCreatorPerformanceByMonthDto[]
    | EventCreatorPerformanceByYearDto[]
  > {
    return this.dashboardService.getEventCreatorPerformance(user.sub, query);
  }

  @ApiOperation({
    summary: 'Get revenue summary',
    description:
      'Get revenue summary including total revenue, available balance, total withdrawn, and pending amount',
  })
  @ApiResponse({
    status: 200,
    description: 'Revenue summary',
    type: RevenueSummaryResponseDto,
  })
  @Get('/revenue/summary')
  getRevenueSummary(
    @AuthUser() user: JwtTokenDto,
  ): Promise<RevenueSummaryResponseDto> {
    return this.dashboardService.getRevenueSummary(user.sub);
  }

  @ApiOperation({
    summary: 'Get top events by revenue',
    description:
      'Get top events with highest revenue from ticket sales for the event creator. Default limit is 5.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of top events to return (default: 5)',
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'Top events by revenue',
    type: [TopEventByRevenueDto],
  })
  @Get('/events/top-revenue')
  getTopEventsByRevenue(
    @AuthUser() user: JwtTokenDto,
    @Query('limit') limit?: string,
  ): Promise<TopEventByRevenueDto[]> {
    const limitNum = limit ? parseInt(limit, 10) : 5;
    return this.dashboardService.getTopEventsByRevenue(user.sub, limitNum);
  }
}
