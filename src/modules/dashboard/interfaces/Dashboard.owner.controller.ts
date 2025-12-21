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
import { BusinessDashboardStatsTotalDto } from '@/common/dto/dashboard/BusinessDashboardStats.response.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { TopLocationByCheckInsDto } from '@/common/dto/dashboard/TopLocationsByCheckIns.response.dto';
import { GetTopLocationsByCheckInsQueryDto } from '@/common/dto/dashboard/GetTopLocationsByCheckIns.query.dto';
import { GetBusinessRevenueQueryDto } from '@/common/dto/dashboard/GetBusinessRevenue.query.dto';
import {
  BusinessRevenueByDayDto,
  BusinessRevenueByMonthDto,
  BusinessRevenueByYearDto,
} from '@/common/dto/dashboard/BusinessRevenue.response.dto';
import { RevenueSummaryResponseDto } from '@/common/dto/dashboard/RevenueSummary.response.dto';
import { TopLocationByRevenueDto } from '@/common/dto/dashboard/TopLocationsByRevenue.response.dto';
import { ApiQuery } from '@nestjs/swagger';
import { IRevenueAnalyticsService } from '@/modules/dashboard/app/IRevenueAnalytics.service';
import { IBusinessAnalyticsService } from '@/modules/dashboard/app/IBusinessAnalytics.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Roles(Role.BUSINESS_OWNER)
@Controller('/owner/dashboard')
export class DashboardOwnerController {
  constructor(
    @Inject(IDashboardService)
    private readonly dashboardService: IDashboardService,

    @Inject(IRevenueAnalyticsService)
    private readonly revenueAnalyticsService: IRevenueAnalyticsService,

    @Inject(IBusinessAnalyticsService)
    private readonly businessAnalyticsService: IBusinessAnalyticsService,
  ) {}

  @ApiOperation({
    summary: 'Get business dashboard statistics',
    description:
      'Get total business dashboard statistics (locations, bookings, check-ins, reviews). Returns total counts for all time.',
  })
  @ApiResponse({
    status: 200,
    description: 'Total business dashboard stats',
    type: BusinessDashboardStatsTotalDto,
  })
  @Get('/stats')
  getBusinessDashboardStats(
    @AuthUser() user: JwtTokenDto,
  ): Promise<BusinessDashboardStatsTotalDto> {
    return this.dashboardService.getBusinessDashboardStats(user.sub);
  }

  @ApiOperation({
    summary: 'Get top locations by check-ins',
    description:
      'Get top locations by number of check-ins in the current month for the business owner.',
  })
  @ApiResponse({
    status: 200,
    description: 'Top locations by check-ins',
    type: [TopLocationByCheckInsDto],
  })
  @Get('/top-locations/check-ins')
  getTopLocationsByCheckIns(
    @AuthUser() user: JwtTokenDto,
    @Query() query: GetTopLocationsByCheckInsQueryDto,
  ): Promise<TopLocationByCheckInsDto[]> {
    return this.dashboardService.getTopLocationsByCheckIns(
      user.sub,
      query.limit || 10,
    );
  }

  @ApiOperation({
    summary: 'Get business revenue overview',
    description:
      'Get business revenue from approved bookings. Returns array based on filter: day -> revenue by day (last 7 days), month -> revenue by month (12 months in current year), year -> revenue by year (all years).',
  })
  @ApiResponse({
    status: 200,
    description: 'Business revenue by day (when filter=day)',
    type: [BusinessRevenueByDayDto],
  })
  @ApiResponse({
    status: 200,
    description: 'Business revenue by month (when filter=month)',
    type: [BusinessRevenueByMonthDto],
  })
  @ApiResponse({
    status: 200,
    description: 'Business revenue by year (when filter=year)',
    type: [BusinessRevenueByYearDto],
  })
  @Get('/revenue/overview')
  getBusinessRevenueOverview(
    @AuthUser() user: JwtTokenDto,
    @Query() query: GetBusinessRevenueQueryDto,
  ): Promise<
    | BusinessRevenueByDayDto[]
    | BusinessRevenueByMonthDto[]
    | BusinessRevenueByYearDto[]
  > {
    return this.dashboardService.getBusinessRevenueOverview(user.sub, query);
  }

  @ApiOperation({
    summary: 'Get revenue summary',
    description:
      'Get revenue summary including total revenue, available balance, total withdrawn, and pending amount',
  })
  @Get('/revenue/summary')
  getRevenueSummary(@AuthUser() user: JwtTokenDto) {
    return this.revenueAnalyticsService.getBusinessRevenueAnalytics(user.sub);
  }

  @ApiOperation({
    summary: 'Get top locations by revenue',
    description:
      'Get top locations with highest revenue from bookings for the business owner. Default limit is 5.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of top locations to return (default: 5)',
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'Top locations by revenue',
    type: [TopLocationByRevenueDto],
  })
  @Get('/locations/top-revenue')
  getTopLocationsByRevenue(
    @AuthUser() user: JwtTokenDto,
    @Query('limit') limit?: string,
  ): Promise<TopLocationByRevenueDto[]> {
    const limitNum = limit ? parseInt(limit, 10) : 5;
    return this.dashboardService.getTopLocationsByRevenue(user.sub, limitNum);
  }

  @ApiOperation({ summary: 'Get general business analytics' })
  @Get('/general-analytics-for-location/:locationId')
  getGeneralBusinessAnalyticsForLocation(
    @Param('locationId') locationId: string,
  ) {
    return this.businessAnalyticsService.getGeneralBusinessAnalytics(
      locationId,
    );
  }
}
