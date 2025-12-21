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
import { BusinessDashboardStatsTotalDto } from '@/common/dto/dashboard/BusinessDashboardStats.response.dto';
import { TopLocationByCheckInsDto } from '@/common/dto/dashboard/TopLocationsByCheckIns.response.dto';
import { GetBusinessRevenueQueryDto } from '@/common/dto/dashboard/GetBusinessRevenue.query.dto';
import {
  BusinessRevenueByDayDto,
  BusinessRevenueByMonthDto,
  BusinessRevenueByYearDto,
} from '@/common/dto/dashboard/BusinessRevenue.response.dto';
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
import { RevenueSummaryResponseDto } from '@/common/dto/dashboard/RevenueSummary.response.dto';
import { TopEventByRevenueDto } from '@/common/dto/dashboard/TopEventsByRevenue.response.dto';
import { TopLocationByRevenueDto } from '@/common/dto/dashboard/TopLocationsByRevenue.response.dto';
import { LocationStatisticsResponseDto } from '@/common/dto/dashboard/LocationStatistics.response.dto';
import { EventStatisticsResponseDto } from '@/common/dto/dashboard/EventStatistics.response.dto';

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
   * Get total business dashboard statistics (locations, bookings, check-ins, reviews)
   * Returns total counts for all time
   */
  getBusinessDashboardStats(
    businessOwnerAccountId: string,
  ): Promise<BusinessDashboardStatsTotalDto>;

  /**
   * Get top locations by check-ins for business owner (current month)
   */
  getTopLocationsByCheckIns(
    businessOwnerAccountId: string,
    limit?: number,
  ): Promise<TopLocationByCheckInsDto[]>;

  /**
   * Get revenue overview for business owner
   * Returns array based on filter: day -> BusinessRevenueByDayDto[], month -> BusinessRevenueByMonthDto[], year -> BusinessRevenueByYearDto[]
   */
  getBusinessRevenueOverview(
    businessOwnerAccountId: string,
    query: GetBusinessRevenueQueryDto,
  ): Promise<
    | BusinessRevenueByDayDto[]
    | BusinessRevenueByMonthDto[]
    | BusinessRevenueByYearDto[]
  >;

  /**
   * Get dashboard statistics for event creator
   * Returns total events, active events, upcoming events, draft events, percentage change, and revenue
   */
  getEventCreatorDashboardStats(
    eventCreatorAccountId: string,
  ): Promise<EventCreatorDashboardStatsResponseDto>;

  /**
   * Get revenue overview for event creator
   * Returns array based on filter: day -> EventCreatorRevenueByDayDto[], month -> EventCreatorRevenueByMonthDto[], year -> EventCreatorRevenueByYearDto[]
   */
  getEventCreatorRevenueOverview(
    eventCreatorAccountId: string,
    query: GetEventCreatorRevenueQueryDto,
  ): Promise<
    | EventCreatorRevenueByDayDto[]
    | EventCreatorRevenueByMonthDto[]
    | EventCreatorRevenueByYearDto[]
  >;

  /**
   * Get event performance timeline for event creator
   * Returns array based on filter: day -> EventCreatorPerformanceByDayDto[], month -> EventCreatorPerformanceByMonthDto[], year -> EventCreatorPerformanceByYearDto[]
   */
  getEventCreatorPerformance(
    eventCreatorAccountId: string,
    query: GetEventCreatorPerformanceQueryDto,
  ): Promise<
    | EventCreatorPerformanceByDayDto[]
    | EventCreatorPerformanceByMonthDto[]
    | EventCreatorPerformanceByYearDto[]
  >;

  /**
   * Get revenue summary for business owner or event creator
   * Returns total revenue, available balance, total withdrawn, and pending amount
   * Role is automatically detected from account
   */
  getRevenueSummary(accountId: string): Promise<RevenueSummaryResponseDto>;

  /**
   * Get top events by revenue for event creator
   * Returns top N events sorted by total revenue from ticket sales
   */
  getTopEventsByRevenue(
    eventCreatorAccountId: string,
    limit?: number,
  ): Promise<TopEventByRevenueDto[]>;

  /**
   * Get top locations by revenue for business owner
   * Returns top N locations sorted by total revenue from bookings
   */
  getTopLocationsByRevenue(
    businessOwnerAccountId: string,
    limit?: number,
  ): Promise<TopLocationByRevenueDto[]>;

  /**
   * Get location statistics for business owner
   * Returns check-ins, revenue, announcements, vouchers, and missions count
   */
  getLocationStatistics(
    locationId: string,
    businessOwnerAccountId: string,
  ): Promise<LocationStatisticsResponseDto>;

  /**
   * Get event statistics for event creator
   * Returns total revenue, paid orders, tickets sold, total tickets, tickets sold percentage, attendees, and ticket types count
   */
  getEventStatistics(
    eventId: string,
    eventCreatorAccountId: string,
  ): Promise<EventStatisticsResponseDto>;
}
