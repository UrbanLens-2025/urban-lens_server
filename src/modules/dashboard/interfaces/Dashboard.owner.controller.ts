import { Controller, Get, Inject, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { IDashboardService } from '@/modules/dashboard/app/IDashboard.service';
import { GetBusinessDashboardStatsQueryDto } from '@/common/dto/dashboard/GetBusinessDashboardStats.query.dto';
import {
  BusinessDashboardStatsByDayDto,
  BusinessDashboardStatsByMonthDto,
  BusinessDashboardStatsByYearDto,
} from '@/common/dto/dashboard/BusinessDashboardStats.response.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { TopLocationByCheckInsDto } from '@/common/dto/dashboard/TopLocationsByCheckIns.response.dto';
import { BusinessRevenueOverviewResponseDto } from '@/common/dto/dashboard/BusinessRevenueOverview.response.dto';
import { GetTopLocationsByCheckInsQueryDto } from '@/common/dto/dashboard/GetTopLocationsByCheckIns.query.dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Roles(Role.BUSINESS_OWNER)
@Controller('/owner/dashboard')
export class DashboardOwnerController {
  constructor(
    @Inject(IDashboardService)
    private readonly dashboardService: IDashboardService,
  ) {}

  @ApiOperation({
    summary: 'Get business dashboard statistics',
    description:
      'Get business dashboard statistics (locations, bookings, check-ins, reviews). Returns array based on filter: day -> stats by day (last 7 days), month -> stats by month (12 months in current year), year -> stats by year (all years).',
  })
  @ApiResponse({
    status: 200,
    description: 'Business dashboard stats by day (when filter=day)',
    type: [BusinessDashboardStatsByDayDto],
  })
  @ApiResponse({
    status: 200,
    description: 'Business dashboard stats by month (when filter=month)',
    type: [BusinessDashboardStatsByMonthDto],
  })
  @ApiResponse({
    status: 200,
    description: 'Business dashboard stats by year (when filter=year)',
    type: [BusinessDashboardStatsByYearDto],
  })
  @Get('/stats')
  getBusinessDashboardStats(
    @AuthUser() user: JwtTokenDto,
    @Query() query: GetBusinessDashboardStatsQueryDto,
  ): Promise<
    | BusinessDashboardStatsByDayDto[]
    | BusinessDashboardStatsByMonthDto[]
    | BusinessDashboardStatsByYearDto[]
  > {
    return this.dashboardService.getBusinessDashboardStats(user.sub, query);
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
      'Get total revenue (all time) and revenue for current month from approved bookings.',
  })
  @ApiResponse({
    status: 200,
    description: 'Business revenue overview',
    type: BusinessRevenueOverviewResponseDto,
  })
  @Get('/revenue/overview')
  getBusinessRevenueOverview(
    @AuthUser() user: JwtTokenDto,
  ): Promise<BusinessRevenueOverviewResponseDto> {
    return this.dashboardService.getBusinessRevenueOverview(user.sub);
  }
}

