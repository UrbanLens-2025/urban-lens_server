import { SummaryResponseDto } from '@/common/dto/dashboard/Summary.response.dto';
import { GetSummaryQueryDto } from '@/common/dto/dashboard/GetSummary.query.dto';
import {
  RevenueDataByDayDto,
  RevenueDataByMonthDto,
  RevenueDataByYearDto,
  UserDataByDayDto,
  UserDataByMonthDto,
  UserDataByYearDto,
} from '@/common/dto/dashboard/Analytics.response.dto';
import { GetAnalyticsQueryDto } from '@/common/dto/dashboard/GetAnalytics.query.dto';
import { GetEventsLocationsTotalsQueryDto } from '@/common/dto/dashboard/GetEventsLocationsTotals.query.dto';
import {
  EventsLocationsDataByDayDto,
  EventsLocationsDataByMonthDto,
  EventsLocationsDataByYearDto,
} from '@/common/dto/dashboard/EventsLocationsTotals.response.dto';
import { GetBusinessDashboardStatsQueryDto } from '@/common/dto/dashboard/GetBusinessDashboardStats.query.dto';
import {
  BusinessDashboardStatsByDayDto,
  BusinessDashboardStatsByMonthDto,
  BusinessDashboardStatsByYearDto,
} from '@/common/dto/dashboard/BusinessDashboardStats.response.dto';
import { TopLocationByCheckInsDto } from '@/common/dto/dashboard/TopLocationsByCheckIns.response.dto';
import { BusinessRevenueOverviewResponseDto } from '@/common/dto/dashboard/BusinessRevenueOverview.response.dto';

export const IDashboardService = Symbol('IDashboardService');

export interface IDashboardService {
  /**
   * Get summary cards for dashboard
   */
  getSummary(query: GetSummaryQueryDto): Promise<SummaryResponseDto>;

  /**
   * Get analytics data for dashboard charts
   * Returns array based on filter: day -> RevenueDataByDayDto[], month -> RevenueDataByMonthDto[], year -> RevenueDataByYearDto[]
   */
  getAnalytics(
    query: GetAnalyticsQueryDto,
  ): Promise<
    RevenueDataByDayDto[] | RevenueDataByMonthDto[] | RevenueDataByYearDto[]
  >;

  /**
   * Get user analytics data for dashboard charts
   * Returns array based on filter: day -> UserDataByDayDto[], month -> UserDataByMonthDto[], year -> UserDataByYearDto[]
   */
  getUserAnalytics(
    query: GetAnalyticsQueryDto,
  ): Promise<UserDataByDayDto[] | UserDataByMonthDto[] | UserDataByYearDto[]>;

  /**
   * Get events and locations statistics
   * Returns array based on filter: day -> EventsLocationsDataByDayDto[], month -> EventsLocationsDataByMonthDto[], year -> EventsLocationsDataByYearDto[]
   */
  getEventsLocationsTotals(
    query: GetEventsLocationsTotalsQueryDto,
  ): Promise<
    | EventsLocationsDataByDayDto[]
    | EventsLocationsDataByMonthDto[]
    | EventsLocationsDataByYearDto[]
  >;

  /**
   * Get business dashboard statistics (locations, bookings, check-ins, reviews)
   * Returns array based on filter: day -> BusinessDashboardStatsByDayDto[], month -> BusinessDashboardStatsByMonthDto[], year -> BusinessDashboardStatsByYearDto[]
   */
  getBusinessDashboardStats(
    businessOwnerAccountId: string,
    query: GetBusinessDashboardStatsQueryDto,
  ): Promise<
    | BusinessDashboardStatsByDayDto[]
    | BusinessDashboardStatsByMonthDto[]
    | BusinessDashboardStatsByYearDto[]
  >;

  /**
   * Get top locations by check-ins for business owner (current month)
   */
  getTopLocationsByCheckIns(
    businessOwnerAccountId: string,
    limit?: number,
  ): Promise<TopLocationByCheckInsDto[]>;

  /**
   * Get revenue overview for business owner (total and this month)
   */
  getBusinessRevenueOverview(
    businessOwnerAccountId: string,
  ): Promise<BusinessRevenueOverviewResponseDto>;
}
