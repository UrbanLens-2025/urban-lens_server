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
}
