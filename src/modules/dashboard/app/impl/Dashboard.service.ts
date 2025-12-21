import { Injectable, NotFoundException } from '@nestjs/common';
import { IDashboardService } from '../IDashboard.service';
import { CoreService } from '@/common/core/Core.service';
import { AccountRepository } from '@/modules/account/infra/repository/Account.repository';
import {
  LocationRepository,
  LocationRepositoryProvider,
} from '@/modules/business/infra/repository/Location.repository';
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
import { BusinessDashboardStatsTotalDto } from '@/common/dto/dashboard/BusinessDashboardStats.response.dto';
import { BusinessEntity } from '@/modules/account/domain/Business.entity';
import { AccountEntity } from '@/modules/account/domain/Account.entity';
import { LocationBookingEntity } from '@/modules/location-booking/domain/LocationBooking.entity';
import { CheckInEntity } from '@/modules/business/domain/CheckIn.entity';
import { PostEntity, PostType } from '@/modules/post/domain/Post.entity';
import { TopLocationByCheckInsDto } from '@/common/dto/dashboard/TopLocationsByCheckIns.response.dto';
import { BusinessRevenueOverviewResponseDto } from '@/common/dto/dashboard/BusinessRevenueOverview.response.dto';
import { LocationBookingStatus } from '@/common/constants/LocationBookingStatus.constant';
import { GetBusinessRevenueQueryDto } from '@/common/dto/dashboard/GetBusinessRevenue.query.dto';
import {
  BusinessRevenueByDayDto,
  BusinessRevenueByMonthDto,
  BusinessRevenueByYearDto,
} from '@/common/dto/dashboard/BusinessRevenue.response.dto';
import { EventCreatorDashboardStatsResponseDto } from '@/common/dto/dashboard/EventCreatorDashboardStats.response.dto';
import { TicketOrderEntity } from '@/modules/event/domain/TicketOrder.entity';
import { EventTicketOrderStatus } from '@/common/constants/EventTicketOrderStatus.constant';
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
import { Role } from '@/common/constants/Role.constant';
import { ISystemConfigService } from '@/modules/utility/app/ISystemConfig.service';
import { SystemConfigKey } from '@/common/constants/SystemConfigKey.constant';
import { Inject } from '@nestjs/common';
import { TopEventByRevenueDto } from '@/common/dto/dashboard/TopEventsByRevenue.response.dto';
import { TopLocationByRevenueDto } from '@/common/dto/dashboard/TopLocationsByRevenue.response.dto';
import { LocationStatisticsResponseDto } from '@/common/dto/dashboard/LocationStatistics.response.dto';
import { EventStatisticsResponseDto } from '@/common/dto/dashboard/EventStatistics.response.dto';
import { LocationVoucherEntity } from '@/modules/gamification/domain/LocationVoucher.entity';
import { LocationMissionEntity } from '@/modules/gamification/domain/LocationMission.entity';
import { EventTicketEntity } from '@/modules/event/domain/EventTicket.entity';
import { EventAttendanceEntity } from '@/modules/event/domain/EventAttendance.entity';
import { EventTagsEntity } from '@/modules/event/domain/EventTags.entity';
import { LocationBookingRepository } from '@/modules/location-booking/infra/repository/LocationBooking.repository';

@Injectable()
export class DashboardService extends CoreService implements IDashboardService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly locationRepository: LocationRepository,
    @Inject(ISystemConfigService)
    private readonly systemConfigService: ISystemConfigService,
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
  ): Promise<BusinessDashboardStatsTotalDto> {
    // Get business_id from account_id
    const businessRepo = this.dataSource.getRepository(BusinessEntity);
    const business = await businessRepo.findOne({
      where: { accountId: businessOwnerAccountId },
    });

    if (!business) {
      throw new Error('Business not found for this account');
    }

    const businessId = business.accountId;

    // Get location IDs for this business
    const locationIds = await this.locationRepository.repo
      .createQueryBuilder('location')
      .select('location.id', 'id')
      .where('location.business_id = :businessId', { businessId })
      .getRawMany()
      .then((results) => results.map((r) => r.id));

    // Get total counts for all time
    const [totalLocations, totalBookings, totalCheckIns, totalReviews] =
      await Promise.all([
        // Total locations
        this.locationRepository.repo
          .createQueryBuilder('location')
          .where('location.business_id = :businessId', { businessId })
          .getCount(),

        // Total bookings
        this.dataSource
          .getRepository(LocationBookingEntity)
          .createQueryBuilder('booking')
          .innerJoin('booking.location', 'location')
          .where('location.business_id = :businessId', { businessId })
          .getCount(),

        // Total check-ins
        this.dataSource
          .getRepository(CheckInEntity)
          .createQueryBuilder('checkin')
          .innerJoin('checkin.location', 'location')
          .where('location.business_id = :businessId', { businessId })
          .getCount(),

        // Total reviews
        locationIds.length > 0
          ? this.dataSource
              .getRepository(PostEntity)
              .createQueryBuilder('post')
              .where('post.location_id IN (:...locationIds)', { locationIds })
              .andWhere('post.type = :reviewType', {
                reviewType: PostType.REVIEW,
              })
              .getCount()
          : Promise.resolve(0),
      ]);

    return {
      locations: totalLocations,
      bookings: totalBookings,
      checkIns: totalCheckIns,
      reviews: totalReviews,
    };
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
    const currentMonthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0,
    );
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
    query: GetBusinessRevenueQueryDto,
  ): Promise<
    | BusinessRevenueByDayDto[]
    | BusinessRevenueByMonthDto[]
    | BusinessRevenueByYearDto[]
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

    // Get location IDs for this business
    const locationIds = await this.locationRepository.repo
      .createQueryBuilder('location')
      .select('location.id', 'id')
      .where('location.business_id = :businessId', { businessId })
      .getRawMany()
      .then((results) => results.map((r) => r.id));

    if (locationIds.length === 0) {
      // Return empty arrays based on filter type
      if (filterType === 'day') {
        return Array.from({ length: 7 }, (_, i) => ({
          day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
          revenue: 0,
        }));
      } else if (filterType === 'month') {
        return Array.from({ length: 12 }, (_, i) => ({
          month: [
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
          ][i],
          revenue: 0,
        }));
      } else {
        return [];
      }
    }

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

      const revenueByDayRaw = await this.dataSource
        .getRepository(LocationBookingEntity)
        .createQueryBuilder('booking')
        .select('EXTRACT(DOW FROM booking.created_at)', 'dayOfWeek')
        .addSelect(
          'COALESCE(SUM(booking.amount_to_pay), 0) - COALESCE(SUM(COALESCE(booking.refunded_amount, 0)), 0)',
          'revenue',
        )
        .where('booking.location_id IN (:...locationIds)', { locationIds })
        .andWhere('booking.status = :status', {
          status: LocationBookingStatus.APPROVED,
        })
        .andWhere('booking.created_at >= :sevenDaysAgo', { sevenDaysAgo })
        .andWhere('booking.created_at <= :now', { now })
        .groupBy('EXTRACT(DOW FROM booking.created_at)')
        .getRawMany();

      // Create map from query results
      const revenueDayMap = new Map<number, number>();
      revenueByDayRaw.forEach((row) => {
        const dayOfWeek = parseInt(row.dayOfWeek, 10);
        revenueDayMap.set(
          dayOfWeek,
          Math.round(parseFloat(row.revenue || '0')),
        );
      });

      // Ensure all 7 days are present (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
      const allDays: BusinessRevenueByDayDto[] = [];
      for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
        allDays.push({
          day: formatDayOfWeek(dayOfWeek),
          revenue: revenueDayMap.get(dayOfWeek) || 0,
        });
      }

      return allDays;
    }

    // 2. Stats by month (12 months in current year)
    if (filterType === 'month') {
      const currentYear = now.getFullYear();
      const yearStart = new Date(currentYear, 0, 1, 0, 0, 0, 0);
      const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999);

      const revenueByMonthRaw = await this.dataSource
        .getRepository(LocationBookingEntity)
        .createQueryBuilder('booking')
        .select('EXTRACT(MONTH FROM booking.created_at)', 'month')
        .addSelect(
          'COALESCE(SUM(booking.amount_to_pay), 0) - COALESCE(SUM(COALESCE(booking.refunded_amount, 0)), 0)',
          'revenue',
        )
        .where('booking.location_id IN (:...locationIds)', { locationIds })
        .andWhere('booking.status = :status', {
          status: LocationBookingStatus.APPROVED,
        })
        .andWhere('booking.created_at >= :yearStart', { yearStart })
        .andWhere('booking.created_at <= :yearEnd', { yearEnd })
        .groupBy('EXTRACT(MONTH FROM booking.created_at)')
        .getRawMany();

      // Create map from query results
      const revenueMonthMap = new Map<number, number>();
      revenueByMonthRaw.forEach((row) => {
        const month = parseInt(row.month, 10);
        revenueMonthMap.set(month, Math.round(parseFloat(row.revenue || '0')));
      });

      // Ensure all 12 months are present (1-12)
      const allMonths: BusinessRevenueByMonthDto[] = [];
      for (let month = 1; month <= 12; month++) {
        allMonths.push({
          month: formatMonth(month),
          revenue: revenueMonthMap.get(month) || 0,
        });
      }

      return allMonths;
    }

    // 3. Stats by year (all years)
    if (filterType === 'year') {
      const revenueByYearRaw = await this.dataSource
        .getRepository(LocationBookingEntity)
        .createQueryBuilder('booking')
        .select('EXTRACT(YEAR FROM booking.created_at)', 'year')
        .addSelect(
          'COALESCE(SUM(booking.amount_to_pay), 0) - COALESCE(SUM(COALESCE(booking.refunded_amount, 0)), 0)',
          'revenue',
        )
        .where('booking.location_id IN (:...locationIds)', { locationIds })
        .andWhere('booking.status = :status', {
          status: LocationBookingStatus.APPROVED,
        })
        .groupBy('EXTRACT(YEAR FROM booking.created_at)')
        .getRawMany();

      // Create map from query results
      const revenueYearMap = new Map<number, number>();
      revenueByYearRaw.forEach((row) => {
        const year = Math.floor(parseFloat(row.year));
        revenueYearMap.set(year, Math.round(parseFloat(row.revenue || '0')));
      });

      // Get all unique years from map
      const allYears = Array.from(revenueYearMap.keys()).sort((a, b) => a - b);

      return allYears.map((year) => ({
        year: String(year),
        revenue: revenueYearMap.get(year) || 0,
      }));
    }

    // Default return (should not reach here, but TypeScript needs it)
    return [];
  }

  async getEventCreatorDashboardStats(
    eventCreatorAccountId: string,
  ): Promise<EventCreatorDashboardStatsResponseDto> {
    const now = new Date();
    const eventRepo = this.dataSource.getRepository(EventEntity);
    const ticketOrderRepo = this.dataSource.getRepository(TicketOrderEntity);

    // Calculate date ranges for percentage change (compare current month with previous month)
    const currentMonthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0,
    );
    const currentMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );
    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
      0,
      0,
      0,
      0,
    );
    const previousMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999,
    );

    // Get all events for this creator
    const [
      totalEvents,
      activeEvents,
      upcomingEvents,
      draftEvents,
      currentMonthEvents,
      previousMonthEvents,
    ] = await Promise.all([
      // Total events
      eventRepo.count({
        where: { createdById: eventCreatorAccountId },
      }),

      // Active events (PUBLISHED and currently happening: start_date <= now <= end_date)
      // Only count events that have both start_date and end_date
      eventRepo
        .createQueryBuilder('event')
        .where('event.account_id = :accountId', {
          accountId: eventCreatorAccountId,
        })
        .andWhere('event.status = :status', { status: EventStatus.PUBLISHED })
        .andWhere('event.start_date IS NOT NULL')
        .andWhere('event.end_date IS NOT NULL')
        .andWhere('event.start_date <= :now', { now })
        .andWhere('event.end_date >= :now', { now })
        .getCount(),

      // Upcoming events (PUBLISHED with start_date in the future)
      eventRepo
        .createQueryBuilder('event')
        .where('event.account_id = :accountId', {
          accountId: eventCreatorAccountId,
        })
        .andWhere('event.status = :status', { status: EventStatus.PUBLISHED })
        .andWhere('event.start_date > :now', { now })
        .getCount(),

      // Draft events
      eventRepo.count({
        where: {
          createdById: eventCreatorAccountId,
          status: EventStatus.DRAFT,
        },
      }),

      // Events created in current month
      eventRepo
        .createQueryBuilder('event')
        .where('event.account_id = :accountId', {
          accountId: eventCreatorAccountId,
        })
        .andWhere('event.created_at >= :currentMonthStart', {
          currentMonthStart,
        })
        .andWhere('event.created_at <= :currentMonthEnd', {
          currentMonthEnd,
        })
        .getCount(),

      // Events created in previous month
      eventRepo
        .createQueryBuilder('event')
        .where('event.account_id = :accountId', {
          accountId: eventCreatorAccountId,
        })
        .andWhere('event.created_at >= :previousMonthStart', {
          previousMonthStart,
        })
        .andWhere('event.created_at <= :previousMonthEnd', {
          previousMonthEnd,
        })
        .getCount(),
    ]);

    // Calculate percentage change
    let totalEventsPercentageChange = 0;
    if (previousMonthEvents > 0) {
      totalEventsPercentageChange =
        ((currentMonthEvents - previousMonthEvents) / previousMonthEvents) *
        100;
    } else if (currentMonthEvents > 0) {
      totalEventsPercentageChange = 100;
    }

    // Get event IDs for this creator
    const eventIds = await eventRepo
      .createQueryBuilder('event')
      .select('event.id', 'id')
      .where('event.account_id = :accountId', {
        accountId: eventCreatorAccountId,
      })
      .getRawMany()
      .then((results) => results.map((r) => r.id));

    // Get total tags count (distinct tags across all events)
    const totalTags =
      eventIds.length > 0
        ? await this.dataSource
            .getRepository(EventTagsEntity)
            .createQueryBuilder('eventTag')
            .select('COUNT(DISTINCT eventTag.tagId)', 'count')
            .where('eventTag.eventId IN (:...eventIds)', { eventIds })
            .getRawOne()
            .then((result) => parseInt(result?.count || '0', 10))
        : 0;

    // Calculate revenue from paid ticket orders
    const [totalRevenueResult, thisMonthRevenueResult] = await Promise.all([
      // Total revenue (all time) - only PAID orders
      eventIds.length > 0
        ? ticketOrderRepo
            .createQueryBuilder('order')
            .select(
              'COALESCE(SUM(order.total_payment_amount), 0) - COALESCE(SUM(COALESCE(order.refunded_amount, 0)), 0)',
              'total',
            )
            .where('order.event_id IN (:...eventIds)', { eventIds })
            .andWhere('order.status = :status', {
              status: EventTicketOrderStatus.PAID,
            })
            .getRawOne()
        : Promise.resolve({ total: '0' }),

      // This month revenue - only PAID orders
      eventIds.length > 0
        ? ticketOrderRepo
            .createQueryBuilder('order')
            .select(
              'COALESCE(SUM(order.total_payment_amount), 0) - COALESCE(SUM(COALESCE(order.refunded_amount, 0)), 0)',
              'total',
            )
            .where('order.event_id IN (:...eventIds)', { eventIds })
            .andWhere('order.status = :status', {
              status: EventTicketOrderStatus.PAID,
            })
            .andWhere('order.created_at >= :currentMonthStart', {
              currentMonthStart,
            })
            .andWhere('order.created_at <= :currentMonthEnd', {
              currentMonthEnd,
            })
            .getRawOne()
        : Promise.resolve({ total: '0' }),
    ]);

    return {
      totalEvents,
      activeEvents,
      upcomingEvents,
      draftEvents,
      totalEventsPercentageChange:
        Math.round(totalEventsPercentageChange * 100) / 100,
      totalRevenue: Math.round(parseFloat(totalRevenueResult?.total || '0')),
      thisMonthRevenue: Math.round(
        parseFloat(thisMonthRevenueResult?.total || '0'),
      ),
      totalTags,
    };
  }

  async getEventCreatorRevenueOverview(
    eventCreatorAccountId: string,
    query: GetEventCreatorRevenueQueryDto,
  ): Promise<
    | EventCreatorRevenueByDayDto[]
    | EventCreatorRevenueByMonthDto[]
    | EventCreatorRevenueByYearDto[]
  > {
    const now = new Date();
    const eventRepo = this.dataSource.getRepository(EventEntity);
    const ticketOrderRepo = this.dataSource.getRepository(TicketOrderEntity);
    const filterType = query.filter || 'day'; // Default to 'day' if not specified

    // Get event IDs for this creator
    const eventIds = await eventRepo
      .createQueryBuilder('event')
      .select('event.id', 'id')
      .where('event.account_id = :accountId', {
        accountId: eventCreatorAccountId,
      })
      .getRawMany()
      .then((results) => results.map((r) => r.id));

    if (eventIds.length === 0) {
      // Return empty arrays based on filter type
      if (filterType === 'day') {
        return Array.from({ length: 7 }, (_, i) => ({
          day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
          revenue: 0,
        }));
      } else if (filterType === 'month') {
        return Array.from({ length: 12 }, (_, i) => ({
          month: [
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
          ][i],
          revenue: 0,
        }));
      } else {
        return [];
      }
    }

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

      const revenueByDayRaw = await ticketOrderRepo
        .createQueryBuilder('order')
        .select('EXTRACT(DOW FROM order.created_at)', 'dayOfWeek')
        .addSelect(
          'COALESCE(SUM(order.total_payment_amount), 0) - COALESCE(SUM(COALESCE(order.refunded_amount, 0)), 0)',
          'revenue',
        )
        .where('order.event_id IN (:...eventIds)', { eventIds })
        .andWhere('order.status = :status', {
          status: EventTicketOrderStatus.PAID,
        })
        .andWhere('order.created_at >= :sevenDaysAgo', { sevenDaysAgo })
        .andWhere('order.created_at <= :now', { now })
        .groupBy('EXTRACT(DOW FROM order.created_at)')
        .getRawMany();

      // Create map from query results
      const revenueDayMap = new Map<number, number>();
      revenueByDayRaw.forEach((row) => {
        const dayOfWeek = parseInt(row.dayOfWeek, 10);
        revenueDayMap.set(
          dayOfWeek,
          Math.round(parseFloat(row.revenue || '0')),
        );
      });

      // Ensure all 7 days are present (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
      const allDays: EventCreatorRevenueByDayDto[] = [];
      for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
        allDays.push({
          day: formatDayOfWeek(dayOfWeek),
          revenue: revenueDayMap.get(dayOfWeek) || 0,
        });
      }

      return allDays;
    }

    // 2. Stats by month (12 months in current year)
    if (filterType === 'month') {
      const currentYear = now.getFullYear();
      const yearStart = new Date(currentYear, 0, 1, 0, 0, 0, 0);
      const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999);

      const revenueByMonthRaw = await ticketOrderRepo
        .createQueryBuilder('order')
        .select('EXTRACT(MONTH FROM order.created_at)', 'month')
        .addSelect(
          'COALESCE(SUM(order.total_payment_amount), 0) - COALESCE(SUM(COALESCE(order.refunded_amount, 0)), 0)',
          'revenue',
        )
        .where('order.event_id IN (:...eventIds)', { eventIds })
        .andWhere('order.status = :status', {
          status: EventTicketOrderStatus.PAID,
        })
        .andWhere('order.created_at >= :yearStart', { yearStart })
        .andWhere('order.created_at <= :yearEnd', { yearEnd })
        .groupBy('EXTRACT(MONTH FROM order.created_at)')
        .getRawMany();

      // Create map from query results
      const revenueMonthMap = new Map<number, number>();
      revenueByMonthRaw.forEach((row) => {
        const month = parseInt(row.month, 10);
        revenueMonthMap.set(month, Math.round(parseFloat(row.revenue || '0')));
      });

      // Ensure all 12 months are present (1-12)
      const allMonths: EventCreatorRevenueByMonthDto[] = [];
      for (let month = 1; month <= 12; month++) {
        allMonths.push({
          month: formatMonth(month),
          revenue: revenueMonthMap.get(month) || 0,
        });
      }

      return allMonths;
    }

    // 3. Stats by year (all years)
    if (filterType === 'year') {
      const revenueByYearRaw = await ticketOrderRepo
        .createQueryBuilder('order')
        .select('EXTRACT(YEAR FROM order.created_at)', 'year')
        .addSelect(
          'COALESCE(SUM(order.total_payment_amount), 0) - COALESCE(SUM(COALESCE(order.refunded_amount, 0)), 0)',
          'revenue',
        )
        .where('order.event_id IN (:...eventIds)', { eventIds })
        .andWhere('order.status = :status', {
          status: EventTicketOrderStatus.PAID,
        })
        .groupBy('EXTRACT(YEAR FROM order.created_at)')
        .getRawMany();

      // Create map from query results
      const revenueYearMap = new Map<number, number>();
      revenueByYearRaw.forEach((row) => {
        const year = Math.floor(parseFloat(row.year));
        revenueYearMap.set(year, Math.round(parseFloat(row.revenue || '0')));
      });

      // Get all unique years from map
      const allYears = Array.from(revenueYearMap.keys()).sort((a, b) => a - b);

      return allYears.map((year) => ({
        year: String(year),
        revenue: revenueYearMap.get(year) || 0,
      }));
    }

    // Default return (should not reach here, but TypeScript needs it)
    return [];
  }

  async getEventCreatorPerformance(
    eventCreatorAccountId: string,
    query: GetEventCreatorPerformanceQueryDto,
  ): Promise<
    | EventCreatorPerformanceByDayDto[]
    | EventCreatorPerformanceByMonthDto[]
    | EventCreatorPerformanceByYearDto[]
  > {
    const now = new Date();
    const eventRepo = this.dataSource.getRepository(EventEntity);
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

      const [draftByDayRaw, publishedByDayRaw, finishedByDayRaw] =
        await Promise.all([
          // Draft events
          eventRepo
            .createQueryBuilder('event')
            .select('EXTRACT(DOW FROM event.created_at)', 'dayOfWeek')
            .addSelect('COUNT(event.id)', 'count')
            .where('event.account_id = :accountId', {
              accountId: eventCreatorAccountId,
            })
            .andWhere('event.status = :status', { status: EventStatus.DRAFT })
            .andWhere('event.created_at >= :sevenDaysAgo', { sevenDaysAgo })
            .andWhere('event.created_at <= :now', { now })
            .groupBy('EXTRACT(DOW FROM event.created_at)')
            .getRawMany(),

          // Published events
          eventRepo
            .createQueryBuilder('event')
            .select('EXTRACT(DOW FROM event.created_at)', 'dayOfWeek')
            .addSelect('COUNT(event.id)', 'count')
            .where('event.account_id = :accountId', {
              accountId: eventCreatorAccountId,
            })
            .andWhere('event.status = :status', {
              status: EventStatus.PUBLISHED,
            })
            .andWhere('event.created_at >= :sevenDaysAgo', { sevenDaysAgo })
            .andWhere('event.created_at <= :now', { now })
            .groupBy('EXTRACT(DOW FROM event.created_at)')
            .getRawMany(),

          // Finished events
          eventRepo
            .createQueryBuilder('event')
            .select('EXTRACT(DOW FROM event.created_at)', 'dayOfWeek')
            .addSelect('COUNT(event.id)', 'count')
            .where('event.account_id = :accountId', {
              accountId: eventCreatorAccountId,
            })
            .andWhere('event.status = :status', {
              status: EventStatus.FINISHED,
            })
            .andWhere('event.created_at >= :sevenDaysAgo', { sevenDaysAgo })
            .andWhere('event.created_at <= :now', { now })
            .groupBy('EXTRACT(DOW FROM event.created_at)')
            .getRawMany(),
        ]);

      // Create maps from query results
      const draftDayMap = new Map<number, number>();
      draftByDayRaw.forEach((row) => {
        const dayOfWeek = parseInt(row.dayOfWeek, 10);
        draftDayMap.set(dayOfWeek, parseInt(row.count, 10));
      });

      const publishedDayMap = new Map<number, number>();
      publishedByDayRaw.forEach((row) => {
        const dayOfWeek = parseInt(row.dayOfWeek, 10);
        publishedDayMap.set(dayOfWeek, parseInt(row.count, 10));
      });

      const finishedDayMap = new Map<number, number>();
      finishedByDayRaw.forEach((row) => {
        const dayOfWeek = parseInt(row.dayOfWeek, 10);
        finishedDayMap.set(dayOfWeek, parseInt(row.count, 10));
      });

      // Ensure all 7 days are present (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
      const allDays: EventCreatorPerformanceByDayDto[] = [];
      for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
        allDays.push({
          day: formatDayOfWeek(dayOfWeek),
          draft: draftDayMap.get(dayOfWeek) || 0,
          published: publishedDayMap.get(dayOfWeek) || 0,
          finished: finishedDayMap.get(dayOfWeek) || 0,
        });
      }

      return allDays;
    }

    // 2. Stats by month (12 months in current year)
    if (filterType === 'month') {
      const currentYear = now.getFullYear();
      const yearStart = new Date(currentYear, 0, 1, 0, 0, 0, 0);
      const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999);

      const [draftByMonthRaw, publishedByMonthRaw, finishedByMonthRaw] =
        await Promise.all([
          // Draft events
          eventRepo
            .createQueryBuilder('event')
            .select('EXTRACT(MONTH FROM event.created_at)', 'month')
            .addSelect('COUNT(event.id)', 'count')
            .where('event.account_id = :accountId', {
              accountId: eventCreatorAccountId,
            })
            .andWhere('event.status = :status', { status: EventStatus.DRAFT })
            .andWhere('event.created_at >= :yearStart', { yearStart })
            .andWhere('event.created_at <= :yearEnd', { yearEnd })
            .groupBy('EXTRACT(MONTH FROM event.created_at)')
            .getRawMany(),

          // Published events
          eventRepo
            .createQueryBuilder('event')
            .select('EXTRACT(MONTH FROM event.created_at)', 'month')
            .addSelect('COUNT(event.id)', 'count')
            .where('event.account_id = :accountId', {
              accountId: eventCreatorAccountId,
            })
            .andWhere('event.status = :status', {
              status: EventStatus.PUBLISHED,
            })
            .andWhere('event.created_at >= :yearStart', { yearStart })
            .andWhere('event.created_at <= :yearEnd', { yearEnd })
            .groupBy('EXTRACT(MONTH FROM event.created_at)')
            .getRawMany(),

          // Finished events
          eventRepo
            .createQueryBuilder('event')
            .select('EXTRACT(MONTH FROM event.created_at)', 'month')
            .addSelect('COUNT(event.id)', 'count')
            .where('event.account_id = :accountId', {
              accountId: eventCreatorAccountId,
            })
            .andWhere('event.status = :status', {
              status: EventStatus.FINISHED,
            })
            .andWhere('event.created_at >= :yearStart', { yearStart })
            .andWhere('event.created_at <= :yearEnd', { yearEnd })
            .groupBy('EXTRACT(MONTH FROM event.created_at)')
            .getRawMany(),
        ]);

      // Create maps from query results
      const draftMonthMap = new Map<number, number>();
      draftByMonthRaw.forEach((row) => {
        const month = parseInt(row.month, 10);
        draftMonthMap.set(month, parseInt(row.count, 10));
      });

      const publishedMonthMap = new Map<number, number>();
      publishedByMonthRaw.forEach((row) => {
        const month = parseInt(row.month, 10);
        publishedMonthMap.set(month, parseInt(row.count, 10));
      });

      const finishedMonthMap = new Map<number, number>();
      finishedByMonthRaw.forEach((row) => {
        const month = parseInt(row.month, 10);
        finishedMonthMap.set(month, parseInt(row.count, 10));
      });

      // Ensure all 12 months are present (1-12)
      const allMonths: EventCreatorPerformanceByMonthDto[] = [];
      for (let month = 1; month <= 12; month++) {
        allMonths.push({
          month: formatMonth(month),
          draft: draftMonthMap.get(month) || 0,
          published: publishedMonthMap.get(month) || 0,
          finished: finishedMonthMap.get(month) || 0,
        });
      }

      return allMonths;
    }

    // 3. Stats by year (all years)
    if (filterType === 'year') {
      const [draftByYearRaw, publishedByYearRaw, finishedByYearRaw] =
        await Promise.all([
          // Draft events
          eventRepo
            .createQueryBuilder('event')
            .select('EXTRACT(YEAR FROM event.created_at)', 'year')
            .addSelect('COUNT(event.id)', 'count')
            .where('event.account_id = :accountId', {
              accountId: eventCreatorAccountId,
            })
            .andWhere('event.status = :status', { status: EventStatus.DRAFT })
            .groupBy('EXTRACT(YEAR FROM event.created_at)')
            .getRawMany(),

          // Published events
          eventRepo
            .createQueryBuilder('event')
            .select('EXTRACT(YEAR FROM event.created_at)', 'year')
            .addSelect('COUNT(event.id)', 'count')
            .where('event.account_id = :accountId', {
              accountId: eventCreatorAccountId,
            })
            .andWhere('event.status = :status', {
              status: EventStatus.PUBLISHED,
            })
            .groupBy('EXTRACT(YEAR FROM event.created_at)')
            .getRawMany(),

          // Finished events
          eventRepo
            .createQueryBuilder('event')
            .select('EXTRACT(YEAR FROM event.created_at)', 'year')
            .addSelect('COUNT(event.id)', 'count')
            .where('event.account_id = :accountId', {
              accountId: eventCreatorAccountId,
            })
            .andWhere('event.status = :status', {
              status: EventStatus.FINISHED,
            })
            .groupBy('EXTRACT(YEAR FROM event.created_at)')
            .getRawMany(),
        ]);

      // Create maps from query results
      const draftYearMap = new Map<number, number>();
      draftByYearRaw.forEach((row) => {
        const year = Math.floor(parseFloat(row.year));
        draftYearMap.set(year, parseInt(row.count, 10));
      });

      const publishedYearMap = new Map<number, number>();
      publishedByYearRaw.forEach((row) => {
        const year = Math.floor(parseFloat(row.year));
        publishedYearMap.set(year, parseInt(row.count, 10));
      });

      const finishedYearMap = new Map<number, number>();
      finishedByYearRaw.forEach((row) => {
        const year = Math.floor(parseFloat(row.year));
        finishedYearMap.set(year, parseInt(row.count, 10));
      });

      // Get all unique years from all maps
      const allYears = new Set([
        ...draftYearMap.keys(),
        ...publishedYearMap.keys(),
        ...finishedYearMap.keys(),
      ]);
      const sortedYears = Array.from(allYears).sort((a, b) => a - b);

      return sortedYears.map((year) => ({
        year: String(year),
        draft: draftYearMap.get(year) || 0,
        published: publishedYearMap.get(year) || 0,
        finished: finishedYearMap.get(year) || 0,
      }));
    }

    // Default return (should not reach here, but TypeScript needs it)
    return [];
  }

  async getRevenueSummary(
    accountId: string,
  ): Promise<RevenueSummaryResponseDto> {
    // Get account to detect role
    const accountRepo = this.dataSource.getRepository(AccountEntity);
    const account = await accountRepo.findOne({
      where: { id: accountId },
      select: ['id', 'role'],
    });

    if (!account) {
      return {
        totalRevenue: 0,
        available: 0,
        pending: 0,
        pendingWithdraw: 0,
        totalBalance: 0,
      };
    }

    // Get wallet for the account
    const walletRepo = this.dataSource.getRepository(WalletEntity);
    const wallet = await walletRepo.findOne({
      where: { ownedBy: accountId },
    });

    if (!wallet) {
      return {
        totalRevenue: 0,
        available: 0,
        pending: 0,
        pendingWithdraw: 0,
        totalBalance: 0,
      };
    }

    let totalRevenue = 0;
    let pendingPayout = 0;

    // Get system payout percentage (same for both roles, but different config keys)
    const systemPayoutPercentageConfig =
      account.role === Role.BUSINESS_OWNER
        ? await this.systemConfigService.getSystemConfigValue(
            SystemConfigKey.LOCATION_BOOKING_SYSTEM_PAYOUT_PERCENTAGE,
          )
        : await this.systemConfigService.getSystemConfigValue(
            SystemConfigKey.EVENT_SYSTEM_PAYOUT_PERCENTAGE,
          );
    const systemPayoutPercentage = systemPayoutPercentageConfig.value || 0.1;

    // Calculate total revenue (already paid out) and pending revenue (not yet paid out) based on role
    if (account.role === Role.BUSINESS_OWNER) {
      const bookingRepo = this.dataSource.getRepository(LocationBookingEntity);

      // Get total revenue: bookings that have been paid out (have businessPayoutTransactionId)
      const paidOutRevenueResult = await bookingRepo
        .createQueryBuilder('booking')
        .innerJoin('booking.location', 'location')
        .select(
          'COALESCE(SUM(booking.amount_to_pay), 0) - COALESCE(SUM(COALESCE(booking.refunded_amount, 0)), 0)',
          'total',
        )
        .where('booking.status = :status', {
          status: LocationBookingStatus.APPROVED,
        })
        .andWhere('location.businessId = :businessId', {
          businessId: accountId,
        })
        .andWhere('booking.businessPayoutTransactionId IS NOT NULL')
        .getRawOne();

      totalRevenue = parseFloat(paidOutRevenueResult?.total || '0');

      // Get pending revenue: bookings that are approved but not yet paid out
      const pendingRevenueResult = await bookingRepo
        .createQueryBuilder('booking')
        .innerJoin('booking.location', 'location')
        .select(
          'COALESCE(SUM(booking.amount_to_pay), 0) - COALESCE(SUM(COALESCE(booking.refunded_amount, 0)), 0)',
          'total',
        )
        .where('booking.status = :status', {
          status: LocationBookingStatus.APPROVED,
        })
        .andWhere('location.businessId = :businessId', {
          businessId: accountId,
        })
        .andWhere('booking.businessPayoutTransactionId IS NULL')
        .getRawOne();

      const pendingRevenue = parseFloat(pendingRevenueResult?.total || '0');
      // Pending payout = pending revenue * (1 - system_payout_percentage)
      pendingPayout = pendingRevenue * (1 - systemPayoutPercentage);
    } else if (account.role === Role.EVENT_CREATOR) {
      const ticketOrderRepo = this.dataSource.getRepository(TicketOrderEntity);

      // Get total revenue: events that have been paid out (have paidOutAt)
      const paidOutRevenueResult = await ticketOrderRepo
        .createQueryBuilder('order')
        .innerJoin('order.event', 'event')
        .select(
          'COALESCE(SUM(order.total_payment_amount), 0) - COALESCE(SUM(COALESCE(order.refunded_amount, 0)), 0)',
          'total',
        )
        .where('order.status = :status', {
          status: EventTicketOrderStatus.PAID,
        })
        .andWhere('event.createdById = :accountId', { accountId })
        .andWhere('event.paidOutAt IS NOT NULL')
        .getRawOne();

      totalRevenue = parseFloat(paidOutRevenueResult?.total || '0');

      // Get pending revenue: events that are finished but not yet paid out
      const pendingRevenueResult = await ticketOrderRepo
        .createQueryBuilder('order')
        .innerJoin('order.event', 'event')
        .select(
          'COALESCE(SUM(order.total_payment_amount), 0) - COALESCE(SUM(COALESCE(order.refunded_amount, 0)), 0)',
          'total',
        )
        .where('order.status = :status', {
          status: EventTicketOrderStatus.PAID,
        })
        .andWhere('event.createdById = :accountId', { accountId })
        .andWhere('event.status = :eventStatus', {
          eventStatus: EventStatus.FINISHED,
        })
        .andWhere('event.paidOutAt IS NULL')
        .getRawOne();

      const pendingRevenue = parseFloat(pendingRevenueResult?.total || '0');
      // Pending payout = pending revenue * (1 - system_payout_percentage)
      pendingPayout = pendingRevenue * (1 - systemPayoutPercentage);
    }

    // Get available balance (balance - lockedBalance)
    const available = Math.max(
      0,
      (wallet.balance || 0) - (wallet.lockedBalance || 0),
    );

    // Get pending withdraw: withdraw transactions with status PENDING or PROCESSING
    const externalTransactionRepo = this.dataSource.getRepository(
      WalletExternalTransactionEntity,
    );
    const pendingWithdrawResult = await externalTransactionRepo
      .createQueryBuilder('transaction')
      .select('COALESCE(SUM(transaction.amount), 0)', 'total')
      .where('transaction.wallet_id = :walletId', { walletId: wallet.id })
      .andWhere('transaction.direction = :direction', {
        direction: WalletExternalTransactionDirection.WITHDRAW,
      })
      .andWhere('transaction.status IN (:...statuses)', {
        statuses: [
          WalletExternalTransactionStatus.PENDING,
          WalletExternalTransactionStatus.PROCESSING,
        ],
      })
      .getRawOne();

    const pendingWithdraw = parseFloat(pendingWithdrawResult?.total || '0');

    // Get total deposit amount
    const depositResult = await externalTransactionRepo
      .createQueryBuilder('transaction')
      .select('COALESCE(SUM(transaction.amount), 0)', 'total')
      .where('transaction.wallet_id = :walletId', { walletId: wallet.id })
      .andWhere('transaction.direction = :direction', {
        direction: WalletExternalTransactionDirection.DEPOSIT,
      })
      .andWhere('transaction.status = :status', {
        status: WalletExternalTransactionStatus.COMPLETED,
      })
      .getRawOne();

    const totalDeposit = parseFloat(depositResult?.total || '0');

    // Total balance = total deposit + total revenue
    const totalBalance = totalDeposit + totalRevenue;

    return {
      totalRevenue: Math.round(totalRevenue),
      available: Math.round(available),
      pending: Math.round(pendingPayout),
      pendingWithdraw: Math.round(pendingWithdraw),
      totalBalance: Math.round(totalBalance),
    };
  }

  async getTopEventsByRevenue(
    eventCreatorAccountId: string,
    limit: number = 5,
  ): Promise<TopEventByRevenueDto[]> {
    const ticketOrderRepo = this.dataSource.getRepository(TicketOrderEntity);
    const eventRepo = this.dataSource.getRepository(EventEntity);

    // Get top events by revenue from ticket sales
    const topEventsRaw = await ticketOrderRepo
      .createQueryBuilder('order')
      .innerJoin('order.event', 'event')
      .select('event.id', 'eventId')
      .addSelect('event.display_name', 'eventName')
      .addSelect(
        'COALESCE(SUM(order.total_payment_amount), 0) - COALESCE(SUM(COALESCE(order.refunded_amount, 0)), 0)',
        'totalRevenue',
      )
      .addSelect('COUNT(order.id)', 'totalTicketsSold')
      .where('event.account_id = :accountId', {
        accountId: eventCreatorAccountId,
      })
      .andWhere('order.status = :status', {
        status: EventTicketOrderStatus.PAID,
      })
      .groupBy('event.id')
      .addGroupBy('event.display_name')
      .orderBy(
        'COALESCE(SUM(order.total_payment_amount), 0) - COALESCE(SUM(COALESCE(order.refunded_amount, 0)), 0)',
        'DESC',
      )
      .limit(limit)
      .getRawMany();

    return topEventsRaw.map((row) => ({
      eventId: row.eventId,
      eventName: row.eventName,
      totalRevenue: Math.round(parseFloat(row.totalRevenue || '0')),
      totalTicketsSold: parseInt(row.totalTicketsSold || '0', 10),
    }));
  }

  async getTopLocationsByRevenue(
    businessOwnerAccountId: string,
    limit: number = 5,
  ): Promise<TopLocationByRevenueDto[]> {
    const locationBookingRepo = LocationBookingRepository(this.dataSource);

    const locationBookings = await locationBookingRepo.find({
      where: {
        location: {
          businessId: businessOwnerAccountId,
        },
        status: LocationBookingStatus.APPROVED,
      },
      relations: {
        location: true,
        fines: true,
      },
      select: {
        locationId: true,
        location: {
          name: true,
        },
        amountToPay: true,
        refundedAmount: true,
        systemCutPercentage: true,
        fines: {
          fineAmount: true,
          isActive: true,
          paidAt: true,
        },
      },
    });

    const result: {
      locationId: string;
      locationName: string;
      revenue: number;
    }[] = [];

    for (const locationBooking of locationBookings) {
      const revenue = LocationBookingEntity.calculateAmountToReceive(
        locationBooking.amountToPay,
        locationBooking.refundedAmount,
        locationBooking.systemCutPercentage,
      );

      result.push({
        locationId: locationBooking.locationId,
        locationName: locationBooking.location.name,
        revenue,
      });
    }

    return result.sort((a, b) => b.revenue - a.revenue).slice(0, limit);

    // Get business_id from account_id
    // const businessRepo = this.dataSource.getRepository(BusinessEntity);
    // const business = await businessRepo.findOne({
    //   where: { accountId: businessOwnerAccountId },
    // });

    // if (!business) {
    //   throw new Error('Business not found for this account');
    // }

    // const businessId = business.accountId;
    // const bookingRepo = this.dataSource.getRepository(LocationBookingEntity);

    // // Get top locations by revenue from bookings
    // const topLocationsRaw = await bookingRepo
    //   .createQueryBuilder('booking')
    //   .innerJoin('booking.location', 'location')
    //   .select('location.id', 'locationId')
    //   .addSelect('location.name', 'locationName')
    //   .addSelect(
    //     'COALESCE(SUM(booking.amount_to_pay * (1 - booking.system_cut_percentage)), 0) - COALESCE(SUM(COALESCE(booking.refunded_amount, 0)), 0)',
    //     'revenue',
    //   )
    //   .where('location.business_id = :businessId', { businessId })
    //   .andWhere('booking.status = :status', {
    //     status: LocationBookingStatus.APPROVED,
    //   })
    //   .groupBy('location.id')
    //   .addGroupBy('location.name')
    //   .limit(limit)
    //   .getRawMany<{
    //     locationId: string;
    //     locationName: string;
    //     revenue: string;
    //   }>();

    // return topLocationsRaw.map((row) => ({
    //   locationId: row.locationId,
    //   locationName: row.locationName,
    //   revenue: Math.round(parseFloat(row.revenue || '0')),
    // }));
  }

  async getLocationStatistics(
    locationId: string,
    businessOwnerAccountId: string,
  ): Promise<LocationStatisticsResponseDto> {
    // Verify location belongs to business owner
    const location = await this.locationRepository.repo.findOne({
      where: { id: locationId, businessId: businessOwnerAccountId },
    });

    if (!location) {
      throw new NotFoundException(
        'Location not found or does not belong to you',
      );
    }

    // Get check-ins count
    const checkIns = await this.dataSource
      .getRepository(CheckInEntity)
      .createQueryBuilder('checkin')
      .where('checkin.locationId = :locationId', { locationId })
      .getCount();

    // Get revenue from bookings
    const revenueResult = await this.dataSource
      .getRepository(LocationBookingEntity)
      .createQueryBuilder('booking')
      .select(
        'COALESCE(SUM(booking.amount_to_pay), 0) - COALESCE(SUM(COALESCE(booking.refunded_amount, 0)), 0)',
        'total',
      )
      .where('booking.locationId = :locationId', { locationId })
      .andWhere('booking.status = :status', {
        status: LocationBookingStatus.APPROVED,
      })
      .getRawOne();

    const revenue = Math.round(parseFloat(revenueResult?.total || '0'));

    // Get announcements (posts) count - both REVIEW and BLOG types
    const announcements = await this.dataSource
      .getRepository(PostEntity)
      .createQueryBuilder('post')
      .where('post.locationId = :locationId', { locationId })
      .andWhere('post.isHidden = :isHidden', { isHidden: false })
      .getCount();

    // Get vouchers count
    const vouchers = await this.dataSource
      .getRepository(LocationVoucherEntity)
      .createQueryBuilder('voucher')
      .where('voucher.locationId = :locationId', { locationId })
      .getCount();

    // Get missions count
    const missions = await this.dataSource
      .getRepository(LocationMissionEntity)
      .createQueryBuilder('mission')
      .where('mission.locationId = :locationId', { locationId })
      .getCount();

    return {
      checkIns,
      revenue,
      announcements,
      vouchers,
      missions,
    };
  }

  async getEventStatistics(
    eventId: string,
    eventCreatorAccountId: string,
  ): Promise<EventStatisticsResponseDto> {
    // Verify event belongs to event creator
    const event = await this.dataSource.getRepository(EventEntity).findOne({
      where: { id: eventId, createdById: eventCreatorAccountId },
    });

    if (!event) {
      throw new NotFoundException('Event not found or does not belong to you');
    }

    // Get total revenue from paid ticket orders
    const revenueResult = await this.dataSource
      .getRepository(TicketOrderEntity)
      .createQueryBuilder('order')
      .select(
        'COALESCE(SUM(order.total_payment_amount), 0) - COALESCE(SUM(COALESCE(order.refunded_amount, 0)), 0)',
        'total',
      )
      .addSelect('COUNT(DISTINCT order.id)', 'paidOrders')
      .where('order.eventId = :eventId', { eventId })
      .andWhere('order.status = :status', {
        status: EventTicketOrderStatus.PAID,
      })
      .getRawOne();

    const totalRevenue = Math.round(parseFloat(revenueResult?.total || '0'));
    const paidOrders = parseInt(revenueResult?.paidOrders || '0', 10);

    // Get tickets sold count (total quantity from all paid orders)
    const ticketsSoldResult = await this.dataSource
      .getRepository(TicketOrderEntity)
      .createQueryBuilder('order')
      .innerJoin('order.orderDetails', 'details')
      .select('COALESCE(SUM(details.quantity), 0)', 'total')
      .where('order.eventId = :eventId', { eventId })
      .andWhere('order.status = :status', {
        status: EventTicketOrderStatus.PAID,
      })
      .getRawOne();

    const ticketsSold = parseInt(ticketsSoldResult?.total || '0', 10);

    // Get total tickets available (sum of totalQuantityAvailable from all active tickets)
    const totalTicketsResult = await this.dataSource
      .getRepository(EventTicketEntity)
      .createQueryBuilder('ticket')
      .select('COALESCE(SUM(ticket.total_quantity_available), 0)', 'total')
      .where('ticket.eventId = :eventId', { eventId })
      .andWhere('ticket.isActive = :isActive', { isActive: true })
      .getRawOne();

    const totalTickets = parseInt(totalTicketsResult?.total || '0', 10);

    // Calculate tickets sold percentage
    const ticketsSoldPercentage =
      totalTickets > 0 ? (ticketsSold / totalTickets) * 100 : 0;

    // Get attendees count (from event attendance)
    const attendees = await this.dataSource
      .getRepository(EventAttendanceEntity)
      .createQueryBuilder('attendance')
      .where('attendance.eventId = :eventId', { eventId })
      .getCount();

    // Get active ticket types count
    const ticketTypes = await this.dataSource
      .getRepository(EventTicketEntity)
      .createQueryBuilder('ticket')
      .where('ticket.eventId = :eventId', { eventId })
      .andWhere('ticket.isActive = :isActive', { isActive: true })
      .getCount();

    return {
      totalRevenue,
      paidOrders,
      ticketsSold,
      totalTickets,
      ticketsSoldPercentage: Math.round(ticketsSoldPercentage * 10) / 10, // Round to 1 decimal place
      attendees,
      ticketTypes,
    };
  }
}
