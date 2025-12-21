import { EventStatus } from '@/common/constants/EventStatus.constant';
import { LocationBookingStatus } from '@/common/constants/LocationBookingStatus.constant';
import { WalletExternalTransactionDirection } from '@/common/constants/WalletExternalTransactionDirection.constant';
import { WalletExternalTransactionStatus } from '@/common/constants/WalletExternalTransactionStatus.constant';
import { WalletTransactionStatus } from '@/common/constants/WalletTransactionStatus.constant';
import { WalletTransactionType } from '@/common/constants/WalletTransactionType.constant';
import { CoreService } from '@/common/core/Core.service';
import { GetBusinessRevenueAnalyticsResponseDto } from '@/common/dto/wallet/analytics/GetBusinessRevenueAnalytics.response.dto';
import { GetEventRevenueAnalyticsResponseDto } from '@/common/dto/wallet/analytics/GetEventRevenueAnalyticsResponse.dto';
import { IRevenueAnalyticsService } from '@/modules/dashboard/app/IRevenueAnalytics.service';
import { EventEntity } from '@/modules/event/domain/Event.entity';
import { EventRepository } from '@/modules/event/infra/repository/Event.repository';
import { LocationBookingEntity } from '@/modules/location-booking/domain/LocationBooking.entity';
import { LocationBookingRepository } from '@/modules/location-booking/infra/repository/LocationBooking.repository';
import { WalletRepository } from '@/modules/wallet/infra/repository/Wallet.repository';
import { WalletExternalTransactionRepository } from '@/modules/wallet/infra/repository/WalletExternalTransaction.repository';
import { WalletTransactionRepository } from '@/modules/wallet/infra/repository/WalletTransaction.repository';
import { Injectable, Logger } from '@nestjs/common';
import { In, IsNull } from 'typeorm';

@Injectable()
export class RevenueAnalyticsService
  extends CoreService
  implements IRevenueAnalyticsService
{
  private readonly logger = new Logger(RevenueAnalyticsService.name);

  async getBusinessRevenueAnalytics(
    userId: string,
  ): Promise<GetBusinessRevenueAnalyticsResponseDto> {
    const walletExternalTransactionRepo = WalletExternalTransactionRepository(
      this.dataSource,
    );
    const walletRepo = WalletRepository(this.dataSource);
    const walletInternalTransactionRepo = WalletTransactionRepository(
      this.dataSource,
    );
    const locationBookingRepo = LocationBookingRepository(this.dataSource);

    const wallet = await walletRepo.findOneOrFail({
      where: {
        ownedBy: userId,
      },
    });

    let totalDeposits = 0;
    const depositTransactions = await walletExternalTransactionRepo.find({
      where: {
        direction: WalletExternalTransactionDirection.DEPOSIT,
        status: WalletExternalTransactionStatus.COMPLETED,
        walletId: wallet.id,
      },
    });

    for (const transaction of depositTransactions) {
      totalDeposits += Number(transaction.amount);
    }

    let totalWithdrawals = 0;
    const withdrawalTransactions = await walletExternalTransactionRepo.find({
      where: {
        direction: WalletExternalTransactionDirection.WITHDRAW,
        status: WalletExternalTransactionStatus.TRANSFERRED,
        walletId: wallet.id,
      },
    });

    for (const transaction of withdrawalTransactions) {
      totalWithdrawals += Number(transaction.amount);
    }

    let totalEarnings = 0;
    const earningTransactions = await walletInternalTransactionRepo.find({
      where: {
        destinationWalletId: wallet.id,
        type: WalletTransactionType.TO_WALLET,
      },
    });

    for (const transaction of earningTransactions) {
      totalEarnings += Number(transaction.amount);
    }

    let totalPendingRevenue = 0;
    const allRelevantBookings = await locationBookingRepo.find({
      where: {
        status: LocationBookingStatus.APPROVED,
        paidOutAt: IsNull(),
        location: {
          businessId: userId,
        },
      },
      relations: {
        fines: true,
      },
    });

    for (const booking of allRelevantBookings) {
      totalPendingRevenue += LocationBookingEntity.calculateAmountToReceive(
        booking.amountToPay,
        booking.refundedAmount,
        booking.systemCutPercentage,
        booking.fines,
      );
    }

    this.logger.log('Analytics results: ', {
      totalDeposits,
      totalWithdrawals,
      totalEarnings,
      totalPendingRevenue,
    });

    return this.mapTo(GetBusinessRevenueAnalyticsResponseDto, {
      totalDeposits,
      totalWithdrawals,
      totalEarnings,
      totalPendingRevenue,

      totalRevenue: totalEarnings,
      availableBalance: wallet.balance,
      pendingRevenue: totalPendingRevenue,
      pendingWithdraw: wallet.lockedBalance,
    });
  }

  async getEventRevenueAnalytics(
    userId: string,
  ): Promise<GetEventRevenueAnalyticsResponseDto> {
    const walletExternalTransactionRepo = WalletExternalTransactionRepository(
      this.dataSource,
    );
    const walletRepo = WalletRepository(this.dataSource);
    const walletInternalTransactionRepo = WalletTransactionRepository(
      this.dataSource,
    );
    const eventRepo = EventRepository(this.dataSource);

    const wallet = await walletRepo.findOneOrFail({
      where: {
        ownedBy: userId,
      },
    });

    let totalDeposits = 0;
    const depositTransactions = await walletExternalTransactionRepo.find({
      where: {
        direction: WalletExternalTransactionDirection.DEPOSIT,
        status: WalletExternalTransactionStatus.COMPLETED,
        walletId: wallet.id,
      },
    });

    for (const transaction of depositTransactions) {
      totalDeposits += Number(transaction.amount);
    }

    let totalWithdrawals = 0;
    const withdrawalTransactions = await walletExternalTransactionRepo.find({
      where: {
        direction: WalletExternalTransactionDirection.WITHDRAW,
        status: WalletExternalTransactionStatus.TRANSFERRED,
        walletId: wallet.id,
      },
    });

    for (const transaction of withdrawalTransactions) {
      totalWithdrawals += Number(transaction.amount);
    }

    let totalEarnings = 0;
    const earningTransactions = await walletInternalTransactionRepo.find({
      where: {
        destinationWalletId: wallet.id,
        type: WalletTransactionType.TO_WALLET,
      },
    });

    for (const transaction of earningTransactions) {
      totalEarnings += Number(transaction.amount);
    }

    let totalPendingRevenue = 0;

    const allRelevantEvents = await eventRepo.find({
      where: {
        createdById: userId, // created by me
        status: In([EventStatus.PUBLISHED, EventStatus.FINISHED]), // is in active/finished status
        paidOutAt: IsNull(), // has not been paid out
      },
      relations: {
        ticketOrders: true,
      },
    });

    for (const event of allRelevantEvents) {
      totalPendingRevenue += EventEntity.calculateAmountToReceive(
        event.ticketOrders,
        event.id,
      );
    }

    const totalRevenue = totalEarnings;
    const pendingRevenue = totalPendingRevenue;
    const availableBalance = wallet.balance;
    const pendingWithdraw = wallet.lockedBalance;

    this.logger.log('Analytics results: ', {
      totalDeposits,
      totalWithdrawals,
      totalEarnings,
      totalPendingRevenue,
    });

    return this.mapTo(GetEventRevenueAnalyticsResponseDto, {
      totalDeposits,
      totalWithdrawals,
      totalEarnings,
      totalPendingRevenue,
      totalRevenue,
      availableBalance,
      pendingWithdraw,
    });
  }
}
