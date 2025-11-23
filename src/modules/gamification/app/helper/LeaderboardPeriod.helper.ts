import {
  LeaderboardPeriodType,
  Season,
} from '@/modules/gamification/domain/LeaderboardSnapshot.entity';

import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

export class LeaderboardPeriodHelper {
  /**
   * Get current week period value (format: YYYY-WW)
   * Uses ISO week format (week starts on Monday)
   */
  static getCurrentWeekPeriod(): string {
    const now = dayjs();
    const year = now.isoWeekYear();
    const week = String(now.isoWeek()).padStart(2, '0');
    return `${year}-W${week}`;
  }

  /**
   * Get current month period value (format: YYYY-MM)
   */
  static getCurrentMonthPeriod(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * Get current year period value (format: YYYY)
   */
  static getCurrentYearPeriod(): string {
    return String(new Date().getFullYear());
  }

  /**
   * Get current season based on month
   * Spring: Mar, Apr, May (3-5)
   * Summer: Jun, Jul, Aug (6-8)
   * Autumn: Sep, Oct, Nov (9-11)
   * Winter: Dec, Jan, Feb (12, 1, 2)
   */
  static getCurrentSeason(): Season {
    const month = new Date().getMonth() + 1; // 1-12

    if (month >= 3 && month <= 5) {
      return Season.SPRING;
    } else if (month >= 6 && month <= 8) {
      return Season.SUMMER;
    } else if (month >= 9 && month <= 11) {
      return Season.AUTUMN;
    } else {
      return Season.WINTER;
    }
  }

  /**
   * Get current seasonal period value (format: YYYY-season)
   */
  static getCurrentSeasonalPeriod(): string {
    const year = new Date().getFullYear();
    const season = this.getCurrentSeason();
    return `${year}-${season}`;
  }

  /**
   * Get period value for a specific period type
   */
  static getPeriodValue(periodType: LeaderboardPeriodType): string {
    switch (periodType) {
      case LeaderboardPeriodType.WEEKLY:
        return this.getCurrentWeekPeriod();
      case LeaderboardPeriodType.MONTHLY:
        return this.getCurrentMonthPeriod();
      case LeaderboardPeriodType.YEARLY:
        return this.getCurrentYearPeriod();
      case LeaderboardPeriodType.SEASONAL:
        return this.getCurrentSeasonalPeriod();
      default:
        throw new Error(`Unknown period type: ${periodType}`);
    }
  }

  /**
   * Get previous week period value
   */
  static getPreviousWeekPeriod(): string {
    const now = dayjs().subtract(1, 'week');
    const year = now.isoWeekYear();
    const week = String(now.isoWeek()).padStart(2, '0');
    return `${year}-W${week}`;
  }

  /**
   * Get previous month period value
   */
  static getPreviousMonthPeriod(): string {
    const now = new Date();
    now.setMonth(now.getMonth() - 1);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * Get previous year period value
   */
  static getPreviousYearPeriod(): string {
    return String(new Date().getFullYear() - 1);
  }

  /**
   * Get previous season
   */
  static getPreviousSeason(): Season {
    const currentSeason = this.getCurrentSeason();
    switch (currentSeason) {
      case Season.SPRING:
        return Season.WINTER;
      case Season.SUMMER:
        return Season.SPRING;
      case Season.AUTUMN:
        return Season.SUMMER;
      case Season.WINTER:
        return Season.AUTUMN;
    }
  }

  /**
   * Get previous seasonal period value
   */
  static getPreviousSeasonalPeriod(): string {
    const year = new Date().getFullYear();
    const previousSeason = this.getPreviousSeason();
    // If current season is spring, previous season is winter of previous year
    if (
      previousSeason === Season.WINTER &&
      this.getCurrentSeason() === Season.SPRING
    ) {
      return `${year - 1}-${previousSeason}`;
    }
    return `${year}-${previousSeason}`;
  }
}
