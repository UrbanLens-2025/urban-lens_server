import { Injectable } from '@nestjs/common';
import { IDashboardService } from '../IDashboard.service';
import { CoreService } from '@/common/core/Core.service';
import { AccountRepository } from '@/modules/account/infra/repository/Account.repository';
import { LocationRepository } from '@/modules/business/infra/repository/Location.repository';
import { EventEntity } from '@/modules/event/domain/Event.entity';
import {
  SummaryResponseDto,
  SummaryCardDto,
} from '@/common/dto/dashboard/Summary.response.dto';
import { GetSummaryQueryDto } from '@/common/dto/dashboard/GetSummary.query.dto';
import { WalletEntity } from '@/modules/wallet/domain/Wallet.entity';
import { WalletType } from '@/common/constants/WalletType.constant';
import { EventStatus } from '@/common/constants/EventStatus.constant';
import {
  RevenueDataByDayDto,
  RevenueDataByMonthDto,
  RevenueDataByYearDto,
  UserDataByDayDto,
  UserDataByMonthDto,
  UserDataByYearDto,
} from '@/common/dto/dashboard/Analytics.response.dto';
import { WalletExternalTransactionEntity } from '@/modules/wallet/domain/WalletExternalTransaction.entity';
import { WalletExternalTransactionDirection } from '@/common/constants/WalletExternalTransactionDirection.constant';
import { WalletExternalTransactionStatus } from '@/common/constants/WalletExternalTransactionStatus.constant';
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
import { BusinessEntity } from '@/modules/account/domain/Business.entity';
import { LocationBookingEntity } from '@/modules/location-booking/domain/LocationBooking.entity';
import { CheckInEntity } from '@/modules/business/domain/CheckIn.entity';
import { PostEntity, PostType } from '@/modules/post/domain/Post.entity';
import { TopLocationByCheckInsDto } from '@/common/dto/dashboard/TopLocationsByCheckIns.response.dto';
import { BusinessRevenueOverviewResponseDto } from '@/common/dto/dashboard/BusinessRevenueOverview.response.dto';
import { LocationBookingStatus } from '@/common/constants/LocationBookingStatus.constant';

@Injectable()
export class DashboardService extends CoreService implements IDashboardService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly locationRepository: LocationRepository,
  ) {
    super();
  }

  async getSummary(query: GetSummaryQueryDto): Promise<SummaryResponseDto> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Parse dates from query or use defaults
    // Format: YYYY-MM-DD
    let startDate: Date | null = null;
    let endDate: Date = now;
    let comparisonEndDate: Date = sevenDaysAgo;

    if (query.startDate) {
      // Parse YYYY-MM-DD format and set to start of day (00:00:00)
      const [year, month, day] = query.startDate.split('-').map(Number);
      startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    }
    if (query.endDate) {
      // Parse YYYY-MM-DD format and set to end of day (23:59:59.999)
      const [year, month, day] = query.endDate.split('-').map(Number);
      endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
    }

    // Calculate comparison end date (7 days before endDate)
    comparisonEndDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const comparisonStartDate = startDate
      ? new Date(
          comparisonEndDate.getTime() -
            (endDate.getTime() - startDate.getTime()),
        )
      : null;

    const walletRepo = this.dataSource.getRepository(WalletEntity);

    // Get all metrics in parallel
    const [
      currentUsersCount,
      previousUsersCount,
      currentLocationsCount,
      previousLocationsCount,
      currentEventsCount,
      previousEventsCount,
      totalWalletBalance,
    ] = await Promise.all([
      // Current period users
      (async () => {
        const qb = this.accountRepository.repo.createQueryBuilder('account');
        if (startDate) {
          qb.where('account.created_at >= :startDate', { startDate }).andWhere(
            'account.created_at <= :endDate',
            { endDate },
          );
        } else {
          // No filter: get total count (all time)
        }
        return qb.getCount();
      })(),

      // Previous period users (7 days ago or comparison period)
      (async () => {
        const qb = this.accountRepository.repo.createQueryBuilder('account');
        if (startDate && comparisonStartDate) {
          qb.where('account.created_at >= :comparisonStartDate', {
            comparisonStartDate,
          }).andWhere('account.created_at <= :comparisonEndDate', {
            comparisonEndDate,
          });
        } else {
          // No filter: get total count up to 7 days ago
          qb.where('account.created_at <= :comparisonEndDate', {
            comparisonEndDate,
          });
        }
        return qb.getCount();
      })(),

      // Current period locations (visible on map)
      (async () => {
        const qb = this.locationRepository.repo.createQueryBuilder('location');
        qb.where('location.isVisibleOnMap = :isVisible', { isVisible: true });
        if (startDate) {
          qb.andWhere('location.created_at >= :startDate', {
            startDate,
          }).andWhere('location.created_at <= :endDate', { endDate });
        }
        // No filter: get all visible locations
        return qb.getCount();
      })(),

      // Previous period locations
      (async () => {
        const qb = this.locationRepository.repo.createQueryBuilder('location');
        qb.where('location.isVisibleOnMap = :isVisible', { isVisible: true });
        if (startDate && comparisonStartDate) {
          qb.andWhere('location.created_at >= :comparisonStartDate', {
            comparisonStartDate,
          }).andWhere('location.created_at <= :comparisonEndDate', {
            comparisonEndDate,
          });
        } else {
          // No filter: get visible locations up to 7 days ago
          qb.andWhere('location.created_at <= :comparisonEndDate', {
            comparisonEndDate,
          });
        }
        return qb.getCount();
      })(),

      (async () => {
        const qb = this.dataSource
          .getRepository(EventEntity)
          .createQueryBuilder('event');
        qb.where('event.status = :status', {
          status: EventStatus.PUBLISHED,
        }).andWhere('(event.end_date IS NULL OR event.end_date > :now)', {
          now,
        });
        if (startDate) {
          qb.andWhere('event.created_at >= :startDate', { startDate }).andWhere(
            'event.created_at <= :endDate',
            { endDate },
          );
        }
        // No filter: get all upcoming events
        return qb.getCount();
      })(),

      // Previous period events
      (async () => {
        const qb = this.dataSource
          .getRepository(EventEntity)
          .createQueryBuilder('event');
        qb.where('event.status = :status', {
          status: EventStatus.PUBLISHED,
        }).andWhere(
          '(event.end_date IS NULL OR event.end_date > :comparisonNow)',
          { comparisonNow: comparisonEndDate },
        );
        if (startDate && comparisonStartDate) {
          qb.andWhere('event.created_at >= :comparisonStartDate', {
            comparisonStartDate,
          }).andWhere('event.created_at <= :comparisonEndDate', {
            comparisonEndDate,
          });
        } else {
          // No filter: get upcoming events up to 7 days ago
          qb.andWhere('event.created_at <= :comparisonEndDate', {
            comparisonEndDate,
          });
        }
        return qb.getCount();
      })(),

      // Current total wallet balance (SYSTEM + ESCROW)
      walletRepo
        .createQueryBuilder('wallet')
        .select(
          'COALESCE(SUM(wallet.balance + wallet.locked_balance), 0)',
          'total',
        )
        .where('wallet.wallet_type IN (:...types)', {
          types: [WalletType.SYSTEM, WalletType.ESCROW],
        })
        .getRawOne()
        .then((result) => parseFloat(result?.total || '0')),
    ]);

    // Get wallet balance 7 days ago for comparison
    const walletBalance7DaysAgo = await walletRepo
      .createQueryBuilder('wallet')
      .select(
        'COALESCE(SUM(wallet.balance + wallet.locked_balance), 0)',
        'total',
      )
      .where('wallet.wallet_type IN (:...types)', {
        types: [WalletType.SYSTEM, WalletType.ESCROW],
      })
      .andWhere('wallet.created_at <= :sevenDaysAgo', {
        sevenDaysAgo,
      })
      .getRawOne()
      .then((result) => parseFloat(result?.total || '0'));

    // Check if there's a date filter
    const hasDateFilter = !!query.startDate || !!query.endDate;

    // Build summary cards
    const summaryCards: SummaryCardDto[] = [];

    // Users card
    const usersCard: SummaryCardDto = {
      title: 'Users',
      value: currentUsersCount,
    };
    if (!hasDateFilter) {
      const calculateDelta = (current: number, previous: number): number => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };
      const usersDelta = calculateDelta(currentUsersCount, previousUsersCount);
      usersCard.delta = Math.abs(usersDelta);
      usersCard.trend = usersDelta >= 0 ? 'up' : 'down';
      usersCard.description =
        usersDelta >= 0
          ? 'Increased compared to 7 days ago'
          : 'Decreased compared to 7 days ago';
    }
    summaryCards.push(usersCard);

    // Locations card
    const locationsCard: SummaryCardDto = {
      title: 'Locations',
      value: currentLocationsCount,
    };
    if (!hasDateFilter) {
      const calculateDelta = (current: number, previous: number): number => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };
      const locationsDelta = calculateDelta(
        currentLocationsCount,
        previousLocationsCount,
      );
      locationsCard.delta = Math.abs(locationsDelta);
      locationsCard.trend = locationsDelta >= 0 ? 'up' : 'down';
      locationsCard.description = 'Locations currently displayed';
    }
    summaryCards.push(locationsCard);

    // Events card
    const eventsCard: SummaryCardDto = {
      title: 'Events',
      value: currentEventsCount,
    };
    if (!hasDateFilter) {
      const calculateDelta = (current: number, previous: number): number => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };
      const eventsDelta = calculateDelta(
        currentEventsCount,
        previousEventsCount,
      );
      eventsCard.delta = Math.abs(eventsDelta);
      eventsCard.trend = eventsDelta >= 0 ? 'up' : 'down';
      eventsCard.description = 'Upcoming events';
    }
    summaryCards.push(eventsCard);

    // Wallet balance card
    const walletCard: SummaryCardDto = {
      title: 'Total Wallet Balance',
      value: Math.round(totalWalletBalance),
    };
    if (!hasDateFilter) {
      const calculateDelta = (current: number, previous: number): number => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };
      const walletDelta = calculateDelta(
        totalWalletBalance,
        walletBalance7DaysAgo,
      );
      walletCard.delta = Math.abs(walletDelta);
      walletCard.trend = walletDelta >= 0 ? 'up' : 'down';
      walletCard.description = 'System + Escrow';
    }
    summaryCards.push(walletCard);

    return summaryCards;
  }

  async getAnalytics(
    query: GetAnalyticsQueryDto,
  ): Promise<
    RevenueDataByDayDto[] | RevenueDataByMonthDto[] | RevenueDataByYearDto[]
  > {
    const externalTransactionRepo = this.dataSource.getRepository(
      WalletExternalTransactionEntity,
    );

    const now = new Date();
    const filterType = query.filter || 'day'; // Default to 'day' if not specified

    // Helper function to format month as Jan, Feb, ..., Dec
    const formatMonth = (month: number): string => {
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      return months[month - 1] || 'Jan';
    };

    // Helper function to format day of week as Mon, Tue, ..., Sun
    const formatDayOfWeek = (dayOfWeek: number): string => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[dayOfWeek] || 'Sun';
    };

    // 1. Revenue by day (last 7 days) - only if filter is 'day' or not specified
    if (filterType === 'day') {
      // Calculate 7 days ago from now
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const revenueByDayRaw = await externalTransactionRepo
        .createQueryBuilder('transaction')
        .select('EXTRACT(DOW FROM transaction.created_at)', 'dayOfWeek')
        .addSelect(
          `SUM(CASE WHEN transaction.direction = '${WalletExternalTransactionDirection.DEPOSIT}' AND transaction.status = '${WalletExternalTransactionStatus.COMPLETED}' THEN transaction.amount ELSE 0 END)`,
          'deposit',
        )
        .addSelect(
          `SUM(CASE WHEN transaction.direction = '${WalletExternalTransactionDirection.WITHDRAW}' AND transaction.status IN ('${WalletExternalTransactionStatus.TRANSFERRED}', '${WalletExternalTransactionStatus.COMPLETED}') THEN transaction.amount ELSE 0 END)`,
          'withdraw',
        )
        .where('transaction.created_at >= :sevenDaysAgo', { sevenDaysAgo })
        .andWhere('transaction.created_at <= :now', { now })
        .groupBy('EXTRACT(DOW FROM transaction.created_at)')
        .orderBy('EXTRACT(DOW FROM transaction.created_at)', 'ASC')
        .getRawMany();

      // Create a map from query results (dayOfWeek -> data)
      const dayMap = new Map<number, RevenueDataByDayDto>();
      revenueByDayRaw.forEach((row) => {
        const dayOfWeek = parseInt(row.dayOfWeek, 10);
        dayMap.set(dayOfWeek, {
          day: formatDayOfWeek(dayOfWeek),
          deposit: Math.round(parseFloat(row.deposit || '0')),
          withdraw: Math.round(parseFloat(row.withdraw || '0')),
        });
      });

      // Ensure all 7 days are present (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
      const allDays: RevenueDataByDayDto[] = [];
      for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
        if (dayMap.has(dayOfWeek)) {
          allDays.push(dayMap.get(dayOfWeek)!);
        } else {
          allDays.push({
            day: formatDayOfWeek(dayOfWeek),
            deposit: 0,
            withdraw: 0,
          });
        }
      }

      return allDays;
    }

    // 2. Revenue by month (12 months in current year) - only if filter is 'month'
    if (filterType === 'month') {
      const currentYear = now.getFullYear();
      const yearStart = new Date(currentYear, 0, 1, 0, 0, 0, 0);
      const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999);

      const revenueByMonthRaw = await externalTransactionRepo
        .createQueryBuilder('transaction')
        .select('EXTRACT(MONTH FROM transaction.created_at)', 'month')
        .addSelect(
          `SUM(CASE WHEN transaction.direction = '${WalletExternalTransactionDirection.DEPOSIT}' AND transaction.status = '${WalletExternalTransactionStatus.COMPLETED}' THEN transaction.amount ELSE 0 END)`,
          'deposit',
        )
        .addSelect(
          `SUM(CASE WHEN transaction.direction = '${WalletExternalTransactionDirection.WITHDRAW}' AND transaction.status IN ('${WalletExternalTransactionStatus.TRANSFERRED}', '${WalletExternalTransactionStatus.COMPLETED}') THEN transaction.amount ELSE 0 END)`,
          'withdraw',
        )
        .where('transaction.created_at >= :yearStart', { yearStart })
        .andWhere('transaction.created_at <= :yearEnd', { yearEnd })
        .groupBy('EXTRACT(MONTH FROM transaction.created_at)')
        .orderBy('EXTRACT(MONTH FROM transaction.created_at)', 'ASC')
        .getRawMany();

      // Create a map from query results (month -> data)
      const monthMap = new Map<number, RevenueDataByMonthDto>();
      revenueByMonthRaw.forEach((row) => {
        const month = parseInt(row.month, 10);
        monthMap.set(month, {
          month: formatMonth(month),
          deposit: Math.round(parseFloat(row.deposit || '0')),
          withdraw: Math.round(parseFloat(row.withdraw || '0')),
        });
      });

      // Ensure all 12 months are present (1-12)
      const allMonths: RevenueDataByMonthDto[] = [];
      for (let month = 1; month <= 12; month++) {
        if (monthMap.has(month)) {
          allMonths.push(monthMap.get(month)!);
        } else {
          allMonths.push({
            month: formatMonth(month),
            deposit: 0,
            withdraw: 0,
          });
        }
      }

      return allMonths;
    }

    // 3. Revenue by year (all years) - only if filter is 'year'
    if (filterType === 'year') {
      const revenueByYearRaw = await externalTransactionRepo
        .createQueryBuilder('transaction')
        .select('EXTRACT(YEAR FROM transaction.created_at)', 'year')
        .addSelect(
          `SUM(CASE WHEN transaction.direction = '${WalletExternalTransactionDirection.DEPOSIT}' AND transaction.status = '${WalletExternalTransactionStatus.COMPLETED}' THEN transaction.amount ELSE 0 END)`,
          'deposit',
        )
        .addSelect(
          `SUM(CASE WHEN transaction.direction = '${WalletExternalTransactionDirection.WITHDRAW}' AND transaction.status IN ('${WalletExternalTransactionStatus.TRANSFERRED}', '${WalletExternalTransactionStatus.COMPLETED}') THEN transaction.amount ELSE 0 END)`,
          'withdraw',
        )
        .groupBy('EXTRACT(YEAR FROM transaction.created_at)')
        .orderBy('EXTRACT(YEAR FROM transaction.created_at)', 'ASC')
        .getRawMany();

      return revenueByYearRaw.map((row) => ({
        year: String(Math.floor(row.year)),
        deposit: Math.round(parseFloat(row.deposit || '0')),
        withdraw: Math.round(parseFloat(row.withdraw || '0')),
      }));
    }

    // Default return (should not reach here, but TypeScript needs it)
    return [];
  }

  async getUserAnalytics(
    query: GetAnalyticsQueryDto,
  ): Promise<UserDataByDayDto[] | UserDataByMonthDto[] | UserDataByYearDto[]> {
    const now = new Date();
    const filterType = query.filter || 'day'; // Default to 'day' if not specified

    // Helper function to format month as Jan, Feb, ..., Dec
    const formatMonth = (month: number): string => {
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      return months[month - 1] || 'Jan';
    };

    // Helper function to format day of week as Mon, Tue, ..., Sun
    const formatDayOfWeek = (dayOfWeek: number): string => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[dayOfWeek] || 'Sun';
    };

    if (filterType === 'day') {
      // Calculate 7 days ago from now
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const usersByDayRaw = await this.accountRepository.repo
        .createQueryBuilder('account')
        .select('EXTRACT(DOW FROM account.created_at)', 'dayOfWeek')
        .addSelect('COUNT(account.id)', 'count')
        .where('account.created_at >= :sevenDaysAgo', { sevenDaysAgo })
        .andWhere('account.created_at <= :now', { now })
        .groupBy('EXTRACT(DOW FROM account.created_at)')
        .orderBy('EXTRACT(DOW FROM account.created_at)', 'ASC')
        .getRawMany();

      // Create a map from query results (dayOfWeek -> data)
      const dayMap = new Map<number, UserDataByDayDto>();
      usersByDayRaw.forEach((row) => {
        const dayOfWeek = parseInt(row.dayOfWeek, 10);
        dayMap.set(dayOfWeek, {
          day: formatDayOfWeek(dayOfWeek),
          count: parseInt(row.count, 10),
        });
      });

      // Ensure all 7 days are present (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
      const allDays: UserDataByDayDto[] = [];
      for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
        if (dayMap.has(dayOfWeek)) {
          allDays.push(dayMap.get(dayOfWeek)!);
        } else {
          allDays.push({
            day: formatDayOfWeek(dayOfWeek),
            count: 0,
          });
        }
      }

      return allDays;
    }

    // 2. Users by month (12 months in current year) - only if filter is 'month'
    if (filterType === 'month') {
      const currentYear = now.getFullYear();
      const yearStart = new Date(currentYear, 0, 1, 0, 0, 0, 0);
      const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999);

      const usersByMonthRaw = await this.accountRepository.repo
        .createQueryBuilder('account')
        .select('EXTRACT(MONTH FROM account.created_at)', 'month')
        .addSelect('COUNT(account.id)', 'count')
        .where('account.created_at >= :yearStart', { yearStart })
        .andWhere('account.created_at <= :yearEnd', { yearEnd })
        .groupBy('EXTRACT(MONTH FROM account.created_at)')
        .orderBy('EXTRACT(MONTH FROM account.created_at)', 'ASC')
        .getRawMany();

      // Create a map from query results (month -> data)
      const monthMap = new Map<number, UserDataByMonthDto>();
      usersByMonthRaw.forEach((row) => {
        const month = parseInt(row.month, 10);
        monthMap.set(month, {
          month: formatMonth(month),
          count: parseInt(row.count, 10),
        });
      });

      // Ensure all 12 months are present (1-12)
      const allMonths: UserDataByMonthDto[] = [];
      for (let month = 1; month <= 12; month++) {
        if (monthMap.has(month)) {
          allMonths.push(monthMap.get(month)!);
        } else {
          allMonths.push({
            month: formatMonth(month),
            count: 0,
          });
        }
      }

      return allMonths;
    }

    // 3. Users by year (all years) - only if filter is 'year'
    if (filterType === 'year') {
      const usersByYearRaw = await this.accountRepository.repo
        .createQueryBuilder('account')
        .select('EXTRACT(YEAR FROM account.created_at)', 'year')
        .addSelect('COUNT(account.id)', 'count')
        .groupBy('EXTRACT(YEAR FROM account.created_at)')
        .orderBy('EXTRACT(YEAR FROM account.created_at)', 'ASC')
        .getRawMany();

      return usersByYearRaw.map((row) => ({
        year: String(Math.floor(row.year)),
        count: parseInt(row.count, 10),
      }));
    }

    // Default return (should not reach here, but TypeScript needs it)
    return [];
  }

  async getEventsLocationsTotals(
    query: GetEventsLocationsTotalsQueryDto,
  ): Promise<
    | EventsLocationsDataByDayDto[]
    | EventsLocationsDataByMonthDto[]
    | EventsLocationsDataByYearDto[]
  > {
    const eventRepo = this.dataSource.getRepository(EventEntity);
    const now = new Date();
    const filterType = query.filter || 'day'; // Default to 'day' if not specified

    // Helper function to format month as Jan, Feb, ..., Dec
    const formatMonth = (month: number): string => {
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      return months[month - 1] || 'Jan';
    };

    // Helper function to format day of week as Mon, Tue, ..., Sun
    const formatDayOfWeek = (dayOfWeek: number): string => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[dayOfWeek] || 'Sun';
    };

    // 1. Events and Locations by day (last 7 days)
    if (filterType === 'day') {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const [eventsByDayRaw, locationsByDayRaw] = await Promise.all([
        eventRepo
          .createQueryBuilder('event')
          .select('EXTRACT(DOW FROM event.created_at)', 'dayOfWeek')
          .addSelect('COUNT(event.id)', 'count')
          .where('event.created_at >= :sevenDaysAgo', { sevenDaysAgo })
          .andWhere('event.created_at <= :now', { now })
          .groupBy('EXTRACT(DOW FROM event.created_at)')
          .orderBy('EXTRACT(DOW FROM event.created_at)', 'ASC')
          .getRawMany(),
        this.locationRepository.repo
          .createQueryBuilder('location')
          .select('EXTRACT(DOW FROM location.created_at)', 'dayOfWeek')
          .addSelect('COUNT(location.id)', 'count')
          .where('location.created_at >= :sevenDaysAgo', { sevenDaysAgo })
          .andWhere('location.created_at <= :now', { now })
          .groupBy('EXTRACT(DOW FROM location.created_at)')
          .orderBy('EXTRACT(DOW FROM location.created_at)', 'ASC')
          .getRawMany(),
      ]);

      // Create maps from query results
      const eventsDayMap = new Map<number, number>();
      eventsByDayRaw.forEach((row) => {
        const dayOfWeek = parseInt(row.dayOfWeek, 10);
        eventsDayMap.set(dayOfWeek, parseInt(row.count, 10));
      });

      const locationsDayMap = new Map<number, number>();
      locationsByDayRaw.forEach((row) => {
        const dayOfWeek = parseInt(row.dayOfWeek, 10);
        locationsDayMap.set(dayOfWeek, parseInt(row.count, 10));
      });

      // Ensure all 7 days are present (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
      const allDays: EventsLocationsDataByDayDto[] = [];
      for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
        allDays.push({
          day: formatDayOfWeek(dayOfWeek),
          events: eventsDayMap.get(dayOfWeek) || 0,
          locations: locationsDayMap.get(dayOfWeek) || 0,
        });
      }

      return allDays;
    }

    // 2. Events and Locations by month (12 months in current year)
    if (filterType === 'month') {
      const currentYear = now.getFullYear();
      const yearStart = new Date(currentYear, 0, 1, 0, 0, 0, 0);
      const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999);

      const [eventsByMonthRaw, locationsByMonthRaw] = await Promise.all([
        eventRepo
          .createQueryBuilder('event')
          .select('EXTRACT(MONTH FROM event.created_at)', 'month')
          .addSelect('COUNT(event.id)', 'count')
          .where('event.created_at >= :yearStart', { yearStart })
          .andWhere('event.created_at <= :yearEnd', { yearEnd })
          .groupBy('EXTRACT(MONTH FROM event.created_at)')
          .orderBy('EXTRACT(MONTH FROM event.created_at)', 'ASC')
          .getRawMany(),
        this.locationRepository.repo
          .createQueryBuilder('location')
          .select('EXTRACT(MONTH FROM location.created_at)', 'month')
          .addSelect('COUNT(location.id)', 'count')
          .where('location.created_at >= :yearStart', { yearStart })
          .andWhere('location.created_at <= :yearEnd', { yearEnd })
          .groupBy('EXTRACT(MONTH FROM location.created_at)')
          .orderBy('EXTRACT(MONTH FROM location.created_at)', 'ASC')
          .getRawMany(),
      ]);

      // Create maps from query results
      const eventsMonthMap = new Map<number, number>();
      eventsByMonthRaw.forEach((row) => {
        const month = parseInt(row.month, 10);
        eventsMonthMap.set(month, parseInt(row.count, 10));
      });

      const locationsMonthMap = new Map<number, number>();
      locationsByMonthRaw.forEach((row) => {
        const month = parseInt(row.month, 10);
        locationsMonthMap.set(month, parseInt(row.count, 10));
      });

      // Ensure all 12 months are present (1-12)
      const allMonths: EventsLocationsDataByMonthDto[] = [];
      for (let month = 1; month <= 12; month++) {
        allMonths.push({
          month: formatMonth(month),
          events: eventsMonthMap.get(month) || 0,
          locations: locationsMonthMap.get(month) || 0,
        });
      }

      return allMonths;
    }

    // 3. Events and Locations by year (all years)
    if (filterType === 'year') {
      const [eventsByYearRaw, locationsByYearRaw] = await Promise.all([
        eventRepo
          .createQueryBuilder('event')
          .select('EXTRACT(YEAR FROM event.created_at)', 'year')
          .addSelect('COUNT(event.id)', 'count')
          .groupBy('EXTRACT(YEAR FROM event.created_at)')
          .orderBy('EXTRACT(YEAR FROM event.created_at)', 'ASC')
          .getRawMany(),
        this.locationRepository.repo
          .createQueryBuilder('location')
          .select('EXTRACT(YEAR FROM location.created_at)', 'year')
          .addSelect('COUNT(location.id)', 'count')
          .groupBy('EXTRACT(YEAR FROM location.created_at)')
          .orderBy('EXTRACT(YEAR FROM location.created_at)', 'ASC')
          .getRawMany(),
      ]);

      // Create maps from query results
      const eventsYearMap = new Map<number, number>();
      eventsByYearRaw.forEach((row) => {
        const year = Math.floor(parseFloat(row.year));
        eventsYearMap.set(year, parseInt(row.count, 10));
      });

      const locationsYearMap = new Map<number, number>();
      locationsByYearRaw.forEach((row) => {
        const year = Math.floor(parseFloat(row.year));
        locationsYearMap.set(year, parseInt(row.count, 10));
      });

      // Get all unique years from both maps
      const allYears = new Set([
        ...eventsYearMap.keys(),
        ...locationsYearMap.keys(),
      ]);
      const sortedYears = Array.from(allYears).sort((a, b) => a - b);

      return sortedYears.map((year) => ({
        year: String(year),
        events: eventsYearMap.get(year) || 0,
        locations: locationsYearMap.get(year) || 0,
      }));
    }

    // Default return (should not reach here, but TypeScript needs it)
    return [];
  }

  async getBusinessDashboardStats(
    businessOwnerAccountId: string,
    query: GetBusinessDashboardStatsQueryDto,
  ): Promise<
    | BusinessDashboardStatsByDayDto[]
    | BusinessDashboardStatsByMonthDto[]
    | BusinessDashboardStatsByYearDto[]
  > {
    // Get business_id from account_id
    const businessRepo = this.dataSource.getRepository(BusinessEntity);
    const business = await businessRepo.findOne({
      where: { accountId: businessOwnerAccountId },
    });

    if (!business) {
      throw new Error('Business not found for this account');
    }

    const businessId = business.accountId;
    const now = new Date();
    const filterType = query.filter || 'day'; // Default to 'day' if not specified

    // Helper function to format month as Jan, Feb, ..., Dec
    const formatMonth = (month: number): string => {
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      return months[month - 1] || 'Jan';
    };

    // Helper function to format day of week as Mon, Tue, ..., Sun
    const formatDayOfWeek = (dayOfWeek: number): string => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[dayOfWeek] || 'Sun';
    };

    // 1. Stats by day (last 7 days)
    if (filterType === 'day') {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      // Get total locations count (not grouped by day)
      const totalLocations = await this.locationRepository.repo
        .createQueryBuilder('location')
        .where('location.business_id = :businessId', { businessId })
        .getCount();

      const [bookingsByDayRaw, checkInsByDayRaw, reviewsByDayRaw] =
        await Promise.all([
        // Bookings
        this.dataSource
          .getRepository(LocationBookingEntity)
          .createQueryBuilder('booking')
          .innerJoin('booking.location', 'location')
          .select('EXTRACT(DOW FROM booking.created_at)', 'dayOfWeek')
          .addSelect('COUNT(booking.id)', 'count')
          .where('location.business_id = :businessId', { businessId })
          .andWhere('booking.created_at >= :sevenDaysAgo', { sevenDaysAgo })
          .andWhere('booking.created_at <= :now', { now })
          .groupBy('EXTRACT(DOW FROM booking.created_at)')
          .getRawMany(),
        // Check-ins
        this.dataSource
          .getRepository(CheckInEntity)
          .createQueryBuilder('checkin')
          .innerJoin('checkin.location', 'location')
          .select('EXTRACT(DOW FROM checkin.created_at)', 'dayOfWeek')
          .addSelect('COUNT(checkin.id)', 'count')
          .where('location.business_id = :businessId', { businessId })
          .andWhere('checkin.created_at >= :sevenDaysAgo', { sevenDaysAgo })
          .andWhere('checkin.created_at <= :now', { now })
          .groupBy('EXTRACT(DOW FROM checkin.created_at)')
          .getRawMany(),
        // Reviews (posts with type = REVIEW)
        (async () => {
          // Get location IDs for this business first
          const locationIds = await this.locationRepository.repo
            .createQueryBuilder('location')
            .select('location.id', 'id')
            .where('location.business_id = :businessId', { businessId })
            .getRawMany()
            .then((results) => results.map((r) => r.id));

          if (locationIds.length === 0) {
            return [];
          }

          return this.dataSource
            .getRepository(PostEntity)
            .createQueryBuilder('post')
            .select('EXTRACT(DOW FROM post.created_at)', 'dayOfWeek')
            .addSelect('COUNT(post.post_id)', 'count')
            .where('post.location_id IN (:...locationIds)', { locationIds })
            .andWhere('post.type = :reviewType', { reviewType: PostType.REVIEW })
            .andWhere('post.created_at >= :sevenDaysAgo', { sevenDaysAgo })
            .andWhere('post.created_at <= :now', { now })
            .groupBy('EXTRACT(DOW FROM post.created_at)')
            .getRawMany();
        })(),
      ]);

      // Create maps from query results
      const bookingsDayMap = new Map<number, number>();
      bookingsByDayRaw.forEach((row) => {
        const dayOfWeek = parseInt(row.dayOfWeek, 10);
        bookingsDayMap.set(dayOfWeek, parseInt(row.count, 10));
      });

      const checkInsDayMap = new Map<number, number>();
      checkInsByDayRaw.forEach((row) => {
        const dayOfWeek = parseInt(row.dayOfWeek, 10);
        checkInsDayMap.set(dayOfWeek, parseInt(row.count, 10));
      });

      const reviewsDayMap = new Map<number, number>();
      reviewsByDayRaw.forEach((row) => {
        const dayOfWeek = parseInt(row.dayOfWeek, 10);
        reviewsDayMap.set(dayOfWeek, parseInt(row.count, 10));
      });

      // Ensure all 7 days are present (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
      const allDays: BusinessDashboardStatsByDayDto[] = [];
      for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
        allDays.push({
          day: formatDayOfWeek(dayOfWeek),
          locations: dayOfWeek === 0 ? totalLocations : 0, // Show total on first day
          bookings: bookingsDayMap.get(dayOfWeek) || 0,
          checkIns: checkInsDayMap.get(dayOfWeek) || 0,
          reviews: reviewsDayMap.get(dayOfWeek) || 0,
        });
      }

      return allDays;
    }

    // 2. Stats by month (12 months in current year)
    if (filterType === 'month') {
      const currentYear = now.getFullYear();
      const yearStart = new Date(currentYear, 0, 1, 0, 0, 0, 0);
      const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999);

      // Get total locations count (not grouped by month)
      const totalLocations = await this.locationRepository.repo
        .createQueryBuilder('location')
        .where('location.business_id = :businessId', { businessId })
        .getCount();

      const [bookingsByMonthRaw, checkInsByMonthRaw, reviewsByMonthRaw] =
        await Promise.all([
        // Bookings
        this.dataSource
          .getRepository(LocationBookingEntity)
          .createQueryBuilder('booking')
          .innerJoin('booking.location', 'location')
          .select('EXTRACT(MONTH FROM booking.created_at)', 'month')
          .addSelect('COUNT(booking.id)', 'count')
          .where('location.business_id = :businessId', { businessId })
          .andWhere('booking.created_at >= :yearStart', { yearStart })
          .andWhere('booking.created_at <= :yearEnd', { yearEnd })
          .groupBy('EXTRACT(MONTH FROM booking.created_at)')
          .getRawMany(),
        // Check-ins
        this.dataSource
          .getRepository(CheckInEntity)
          .createQueryBuilder('checkin')
          .innerJoin('checkin.location', 'location')
          .select('EXTRACT(MONTH FROM checkin.created_at)', 'month')
          .addSelect('COUNT(checkin.id)', 'count')
          .where('location.business_id = :businessId', { businessId })
          .andWhere('checkin.created_at >= :yearStart', { yearStart })
          .andWhere('checkin.created_at <= :yearEnd', { yearEnd })
          .groupBy('EXTRACT(MONTH FROM checkin.created_at)')
          .getRawMany(),
        // Reviews
        (async () => {
          // Get location IDs for this business first
          const locationIds = await this.locationRepository.repo
            .createQueryBuilder('location')
            .select('location.id', 'id')
            .where('location.business_id = :businessId', { businessId })
            .getRawMany()
            .then((results) => results.map((r) => r.id));

          if (locationIds.length === 0) {
            return [];
          }

          return this.dataSource
            .getRepository(PostEntity)
            .createQueryBuilder('post')
            .select('EXTRACT(MONTH FROM post.created_at)', 'month')
            .addSelect('COUNT(post.post_id)', 'count')
            .where('post.location_id IN (:...locationIds)', { locationIds })
            .andWhere('post.type = :reviewType', { reviewType: PostType.REVIEW })
            .andWhere('post.created_at >= :yearStart', { yearStart })
            .andWhere('post.created_at <= :yearEnd', { yearEnd })
            .groupBy('EXTRACT(MONTH FROM post.created_at)')
            .getRawMany();
        })(),
      ]);

      // Create maps from query results
      const bookingsMonthMap = new Map<number, number>();
      bookingsByMonthRaw.forEach((row) => {
        const month = parseInt(row.month, 10);
        bookingsMonthMap.set(month, parseInt(row.count, 10));
      });

      const checkInsMonthMap = new Map<number, number>();
      checkInsByMonthRaw.forEach((row) => {
        const month = parseInt(row.month, 10);
        checkInsMonthMap.set(month, parseInt(row.count, 10));
      });

      const reviewsMonthMap = new Map<number, number>();
      reviewsByMonthRaw.forEach((row) => {
        const month = parseInt(row.month, 10);
        reviewsMonthMap.set(month, parseInt(row.count, 10));
      });

      // Ensure all 12 months are present (1-12)
      const allMonths: BusinessDashboardStatsByMonthDto[] = [];
      for (let month = 1; month <= 12; month++) {
        allMonths.push({
          month: formatMonth(month),
          locations: month === 1 ? totalLocations : 0, // Show total in first month
          bookings: bookingsMonthMap.get(month) || 0,
          checkIns: checkInsMonthMap.get(month) || 0,
          reviews: reviewsMonthMap.get(month) || 0,
        });
      }

      return allMonths;
    }

    // 3. Stats by year (all years)
    if (filterType === 'year') {
      // Get total locations count (not grouped by year)
      const totalLocations = await this.locationRepository.repo
        .createQueryBuilder('location')
        .where('location.business_id = :businessId', { businessId })
        .getCount();

      const [bookingsByYearRaw, checkInsByYearRaw, reviewsByYearRaw] =
        await Promise.all([
        // Bookings
        this.dataSource
          .getRepository(LocationBookingEntity)
          .createQueryBuilder('booking')
          .innerJoin('booking.location', 'location')
          .select('EXTRACT(YEAR FROM booking.created_at)', 'year')
          .addSelect('COUNT(booking.id)', 'count')
          .where('location.business_id = :businessId', { businessId })
          .groupBy('EXTRACT(YEAR FROM booking.created_at)')
          .getRawMany(),
        // Check-ins
        this.dataSource
          .getRepository(CheckInEntity)
          .createQueryBuilder('checkin')
          .innerJoin('checkin.location', 'location')
          .select('EXTRACT(YEAR FROM checkin.created_at)', 'year')
          .addSelect('COUNT(checkin.id)', 'count')
          .where('location.business_id = :businessId', { businessId })
          .groupBy('EXTRACT(YEAR FROM checkin.created_at)')
          .getRawMany(),
        // Reviews
        (async () => {
          // Get location IDs for this business first
          const locationIds = await this.locationRepository.repo
            .createQueryBuilder('location')
            .select('location.id', 'id')
            .where('location.business_id = :businessId', { businessId })
            .getRawMany()
            .then((results) => results.map((r) => r.id));

          if (locationIds.length === 0) {
            return [];
          }

          return this.dataSource
            .getRepository(PostEntity)
            .createQueryBuilder('post')
            .select('EXTRACT(YEAR FROM post.created_at)', 'year')
            .addSelect('COUNT(post.post_id)', 'count')
            .where('post.location_id IN (:...locationIds)', { locationIds })
            .andWhere('post.type = :reviewType', { reviewType: PostType.REVIEW })
            .groupBy('EXTRACT(YEAR FROM post.created_at)')
            .getRawMany();
        })(),
      ]);

      // Create maps from query results
      const bookingsYearMap = new Map<number, number>();
      bookingsByYearRaw.forEach((row) => {
        const year = Math.floor(parseFloat(row.year));
        bookingsYearMap.set(year, parseInt(row.count, 10));
      });

      const checkInsYearMap = new Map<number, number>();
      checkInsByYearRaw.forEach((row) => {
        const year = Math.floor(parseFloat(row.year));
        checkInsYearMap.set(year, parseInt(row.count, 10));
      });

      const reviewsYearMap = new Map<number, number>();
      reviewsByYearRaw.forEach((row) => {
        const year = Math.floor(parseFloat(row.year));
        reviewsYearMap.set(year, parseInt(row.count, 10));
      });

      // Get all unique years from all maps
      const allYears = new Set([
        ...bookingsYearMap.keys(),
        ...checkInsYearMap.keys(),
        ...reviewsYearMap.keys(),
      ]);
      const sortedYears = Array.from(allYears).sort((a, b) => a - b);

      return sortedYears.map((year) => ({
        year: String(year),
        locations: totalLocations, // Total locations across all years
        bookings: bookingsYearMap.get(year) || 0,
        checkIns: checkInsYearMap.get(year) || 0,
        reviews: reviewsYearMap.get(year) || 0,
      }));
    }

    // Default return (should not reach here, but TypeScript needs it)
    return [];
  }

  async getTopLocationsByCheckIns(
    businessOwnerAccountId: string,
    limit: number = 10,
  ): Promise<TopLocationByCheckInsDto[]> {
    // Get business_id from account_id
    const businessRepo = this.dataSource.getRepository(BusinessEntity);
    const business = await businessRepo.findOne({
      where: { accountId: businessOwnerAccountId },
    });

    if (!business) {
      throw new Error('Business not found for this account');
    }

    const businessId = business.accountId;
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const currentMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const topLocations = await this.dataSource
      .getRepository(CheckInEntity)
      .createQueryBuilder('checkin')
      .innerJoin('checkin.location', 'location')
      .select('location.id', 'locationId')
      .addSelect('location.name', 'locationName')
      .addSelect('COUNT(checkin.id)', 'checkInsCount')
      .where('location.business_id = :businessId', { businessId })
      .andWhere('checkin.created_at >= :currentMonthStart', {
        currentMonthStart,
      })
      .andWhere('checkin.created_at <= :currentMonthEnd', {
        currentMonthEnd,
      })
      .groupBy('location.id')
      .addGroupBy('location.name')
      .orderBy('COUNT(checkin.id)', 'DESC')
      .limit(limit)
      .getRawMany();

    return topLocations.map((row) => ({
      locationId: row.locationId,
      locationName: row.locationName,
      checkInsCount: parseInt(row.checkInsCount, 10),
    }));
  }

  async getBusinessRevenueOverview(
    businessOwnerAccountId: string,
  ): Promise<BusinessRevenueOverviewResponseDto> {
    // Get business_id from account_id
    const businessRepo = this.dataSource.getRepository(BusinessEntity);
    const business = await businessRepo.findOne({
      where: { accountId: businessOwnerAccountId },
    });

    if (!business) {
      throw new Error('Business not found for this account');
    }

    const businessId = business.accountId;
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const currentMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // Get location IDs for this business
    const locationIds = await this.locationRepository.repo
      .createQueryBuilder('location')
      .select('location.id', 'id')
      .where('location.business_id = :businessId', { businessId })
      .getRawMany()
      .then((results) => results.map((r) => r.id));

    if (locationIds.length === 0) {
      return {
        totalRevenue: 0,
        thisMonthRevenue: 0,
      };
    }

    // Calculate total revenue (all time) - only APPROVED bookings
    const totalRevenueResult = await this.dataSource
      .getRepository(LocationBookingEntity)
      .createQueryBuilder('booking')
      .select(
        'COALESCE(SUM(booking.amount_to_pay), 0) - COALESCE(SUM(COALESCE(booking.refunded_amount, 0)), 0)',
        'total',
      )
      .where('booking.location_id IN (:...locationIds)', { locationIds })
      .andWhere('booking.status = :status', {
        status: LocationBookingStatus.APPROVED,
      })
      .getRawOne();

    // Calculate this month revenue - only APPROVED bookings
    const thisMonthRevenueResult = await this.dataSource
      .getRepository(LocationBookingEntity)
      .createQueryBuilder('booking')
      .select(
        'COALESCE(SUM(booking.amount_to_pay), 0) - COALESCE(SUM(COALESCE(booking.refunded_amount, 0)), 0)',
        'total',
      )
      .where('booking.location_id IN (:...locationIds)', { locationIds })
      .andWhere('booking.status = :status', {
        status: LocationBookingStatus.APPROVED,
      })
      .andWhere('booking.created_at >= :currentMonthStart', {
        currentMonthStart,
      })
      .andWhere('booking.created_at <= :currentMonthEnd', {
        currentMonthEnd,
      })
      .getRawOne();

    return {
      totalRevenue: Math.round(
        parseFloat(totalRevenueResult?.total || '0'),
      ),
      thisMonthRevenue: Math.round(
        parseFloat(thisMonthRevenueResult?.total || '0'),
      ),
    };
  }
}
