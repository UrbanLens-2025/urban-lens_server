import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { IDashboardService } from '@/modules/dashboard/app/IDashboard.service';
import { GetSummaryQueryDto } from '@/common/dto/dashboard/GetSummary.query.dto';
import { GetAnalyticsQueryDto } from '@/common/dto/dashboard/GetAnalytics.query.dto';
import {
  RevenueDataByDayDto,
  RevenueDataByMonthDto,
  RevenueDataByYearDto,
  UserDataByDayDto,
  UserDataByMonthDto,
  UserDataByYearDto,
} from '@/common/dto/dashboard/Analytics.response.dto';
import { GetEventsLocationsTotalsQueryDto } from '@/common/dto/dashboard/GetEventsLocationsTotals.query.dto';
import {
  EventsLocationsDataByDayDto,
  EventsLocationsDataByMonthDto,
  EventsLocationsDataByYearDto,
} from '@/common/dto/dashboard/EventsLocationsTotals.response.dto';
import { IEventAnalyticsService } from '@/modules/dashboard/app/IEventAnalytics.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('/admin/dashboard')
export class DashboardAdminController {
  constructor(
    @Inject(IDashboardService)
    private readonly dashboardService: IDashboardService,
    @Inject(IEventAnalyticsService)
    private readonly eventAnalyticsService: IEventAnalyticsService,
  ) {}

  @ApiOperation({
    summary: 'Get dashboard summary cards',
    description:
      'Get summary cards with metrics (users, locations, events, wallet balance). Can filter by date range.',
  })
  @Get('/summary')
  getSummary(@Query() query: GetSummaryQueryDto) {
    return this.dashboardService.getSummary(query);
  }

  @ApiOperation({
    summary: 'Get dashboard analytics data',
    description:
      'Get analytics data for charts. Returns array based on filter: day -> revenue by day (last 7 days), month -> revenue by month (12 months in current year), year -> revenue by year (all years).',
  })
  @ApiResponse({
    status: 200,
    description: 'Revenue data by day (when filter=day)',
    type: [RevenueDataByDayDto],
  })
  @ApiResponse({
    status: 200,
    description: 'Revenue data by month (when filter=month)',
    type: [RevenueDataByMonthDto],
  })
  @ApiResponse({
    status: 200,
    description: 'Revenue data by year (when filter=year)',
    type: [RevenueDataByYearDto],
  })
  @Get('/analytics')
  getAnalytics(@Query() query: GetAnalyticsQueryDto) {
    return this.dashboardService.getAnalytics(query);
  }

  @ApiOperation({
    summary: 'Get user analytics data',
    description:
      'Get user analytics data for charts. Returns array based on filter: day -> users by day (last 7 days), month -> users by month (12 months in current year), year -> users by year (all years).',
  })
  @ApiResponse({
    status: 200,
    description: 'User data by day (when filter=day)',
    type: [UserDataByDayDto],
  })
  @ApiResponse({
    status: 200,
    description: 'User data by month (when filter=month)',
    type: [UserDataByMonthDto],
  })
  @ApiResponse({
    status: 200,
    description: 'User data by year (when filter=year)',
    type: [UserDataByYearDto],
  })
  @Get('/analytics/users')
  getUserAnalytics(@Query() query: GetAnalyticsQueryDto) {
    return this.dashboardService.getUserAnalytics(query);
  }

  @ApiOperation({
    summary: 'Get events and locations statistics',
    description:
      'Get events and locations statistics. Returns array based on filter: day -> events and locations by day (last 7 days), month -> events and locations by month (12 months in current year), year -> events and locations by year (all years).',
  })
  @ApiResponse({
    status: 200,
    description: 'Events and locations data by day (when filter=day)',
    type: [EventsLocationsDataByDayDto],
  })
  @ApiResponse({
    status: 200,
    description: 'Events and locations data by month (when filter=month)',
    type: [EventsLocationsDataByMonthDto],
  })
  @ApiResponse({
    status: 200,
    description: 'Events and locations data by year (when filter=year)',
    type: [EventsLocationsDataByYearDto],
  })
  @Get('/totals/events-locations')
  getEventsLocationsTotals(
    @Query() query: GetEventsLocationsTotalsQueryDto,
  ): Promise<
    | EventsLocationsDataByDayDto[]
    | EventsLocationsDataByMonthDto[]
    | EventsLocationsDataByYearDto[]
  > {
    return this.dashboardService.getEventsLocationsTotals(query);
  }

  @ApiOperation({
    summary: 'Get general event analytics',
    description: 'Get general event analytics for a specific event',
  })
  @Get('/events/general-analytics/:eventId')
  getGeneralEventAnalytics(@Param('eventId') eventId: string) {
    return this.eventAnalyticsService.getGeneralEventAnalytics(eventId);
  }
}
