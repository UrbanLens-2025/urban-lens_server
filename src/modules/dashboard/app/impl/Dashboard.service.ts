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
      title: 'Người dùng',
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
          ? 'Tăng so với 7 ngày trước'
          : 'Giảm so với 7 ngày trước';
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
      locationsCard.description = 'Điểm đang hiển thị';
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
      eventsCard.description = 'Sự kiện sắp diễn ra';
    }
    summaryCards.push(eventsCard);

    // Wallet balance card
    const walletCard: SummaryCardDto = {
      title: 'Tổng số dư ví',
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

    // Helper function to format month as T1, T2, ..., T12
    const formatMonth = (month: number): string => {
      return `T${month}`;
    };

    // Helper function to format day of week as T2, T3, ..., CN
    const formatDayOfWeek = (dayOfWeek: number): string => {
      const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      return days[dayOfWeek] || 'CN';
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

      // Ensure all 7 days are present (0=CN, 1=T2, 2=T3, 3=T4, 4=T5, 5=T6, 6=T7)
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

    // Helper function to format month as T1, T2, ..., T12
    const formatMonth = (month: number): string => {
      return `T${month}`;
    };

    // Helper function to format day of week as T2, T3, ..., CN
    const formatDayOfWeek = (dayOfWeek: number): string => {
      const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      return days[dayOfWeek] || 'CN';
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

      // Ensure all 7 days are present (0=CN, 1=T2, 2=T3, 3=T4, 4=T5, 5=T6, 6=T7)
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
}
