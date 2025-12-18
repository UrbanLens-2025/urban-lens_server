import { Injectable } from '@nestjs/common';
import { UserLocationVoucherExchangeHistoryRepository } from '../../infra/repository/UserLocationVoucherExchangeHistory.repository';
import { UserLocationProfileRepository } from '@/modules/gamification/infra/repository/UserLocationProfile.repository';
import { LocationVoucherRepository } from '../../infra/repository/LocationVoucher.repository';
import { UserLocationVoucherExchangeHistoryEntity } from '../../domain/UserLocationVoucherExchangeHistory.entity';

export interface IVoucherExchangeService {
  exchangeVoucher(
    userProfileId: string,
    voucherId: string,
  ): Promise<{
    success: boolean;
    message: string;
    exchangeHistory?: UserLocationVoucherExchangeHistoryEntity;
  }>;

  getUserVouchers(
    userProfileId: string,
  ): Promise<UserLocationVoucherExchangeHistoryEntity[]>;

  getUserVoucherStats(userProfileId: string): Promise<{
    totalVouchers: number;
    totalUsed: number;
    availableVouchers: number;
  }>;

  getUserExchangeHistory(
    userProfileId: string,
  ): Promise<UserLocationVoucherExchangeHistoryEntity[]>;

  useVoucher(
    userProfileId: string,
    exchangeHistoryId: string,
  ): Promise<{
    success: boolean;
    message: string;
  }>;
}

@Injectable()
export class VoucherExchangeService implements IVoucherExchangeService {
  constructor(
    private readonly userLocationVoucherExchangeHistoryRepository: UserLocationVoucherExchangeHistoryRepository,
    private readonly userLocationProfileRepository: UserLocationProfileRepository,
    private readonly locationVoucherRepository: LocationVoucherRepository,
  ) {}

  async exchangeVoucher(
    userProfileId: string,
    voucherId: string,
  ): Promise<{
    success: boolean;
    message: string;
    exchangeHistory?: UserLocationVoucherExchangeHistoryEntity;
  }> {
    try {
      // Get voucher details
      const voucher = await this.locationVoucherRepository.repo.findOne({
        where: { id: voucherId },
        relations: ['location'],
      });

      if (!voucher) {
        return {
          success: false,
          message: 'Voucher not found',
        };
      }

      // Check if user has reached the redemption limit for this voucher
      const exchangeHistoryCount =
        await this.userLocationVoucherExchangeHistoryRepository.repo.count({
          where: {
            userProfileId,
            voucherId,
          },
        });

      if (exchangeHistoryCount >= voucher.userRedeemedLimit) {
        return {
          success: false,
          message: `You have reached the maximum redemption limit (${voucher.userRedeemedLimit}) for this voucher`,
        };
      }

      // Check user's profile at this location (required for all vouchers)
      const userLocationProfile =
        await this.userLocationProfileRepository.findByUserAndLocation(
          userProfileId,
          voucher.locationId,
        );

      if (!userLocationProfile) {
        return {
          success: false,
          message:
            'You must check-in at this location first to exchange vouchers',
        };
      }

      if (voucher.pricePoint > 0) {
        if (userLocationProfile.availablePoints < voucher.pricePoint) {
          return {
            success: false,
            message: `Insufficient points. You need ${voucher.pricePoint} points but only have ${userLocationProfile.availablePoints}`,
          };
        }

        // Deduct points from user location profile
        await this.userLocationProfileRepository.updateAvailablePoints(
          userProfileId,
          voucher.locationId,
          voucher.pricePoint,
        );
      }

      // Create exchange history (also serves as user voucher record)
      const exchangeHistory =
        await this.userLocationVoucherExchangeHistoryRepository.createExchangeHistory(
          userProfileId,
          voucherId,
          voucher.pricePoint,
        );

      const successMessage =
        voucher.pricePoint > 0
          ? `Successfully exchanged ${voucher.pricePoint} points for voucher: ${voucher.title}`
          : `Successfully redeemed voucher: ${voucher.title}`;

      return {
        success: true,
        message: successMessage,
        exchangeHistory,
      };
    } catch (error) {
      return {
        success: false,
        message: `Exchange failed: ${error.message}`,
      };
    }
  }

  async getUserVouchers(
    userProfileId: string,
    status?: 'expired' | 'used' | 'available',
  ): Promise<UserLocationVoucherExchangeHistoryEntity[]> {
    // Get all vouchers (not just available ones)
    const allVouchers =
      await this.userLocationVoucherExchangeHistoryRepository.findByUser(
      userProfileId,
    );

    // If no filter, return all vouchers
    if (!status) {
      return allVouchers;
    }

    const now = new Date();

    // Filter by status
    return allVouchers.filter((voucher) => {
      const isUsed = voucher.usedAt !== null;
      const isExpired = voucher.voucher.endDate
        ? new Date(voucher.voucher.endDate) < now
        : false;
      const isAvailable = !isUsed && !isExpired;

      switch (status) {
        case 'expired':
          return isExpired;
        case 'used':
          return isUsed;
        case 'available':
          return isAvailable;
        default:
          return true;
      }
    });
  }

  async getUserVoucherStats(userProfileId: string): Promise<{
    totalVouchers: number;
    totalUsed: number;
    availableVouchers: number;
  }> {
    const vouchers =
      await this.userLocationVoucherExchangeHistoryRepository.findByUser(
        userProfileId,
      );

    const totalVouchers = vouchers.length;
    const totalUsed = vouchers.filter((v) => v.usedAt !== null).length;
    const availableVouchers = vouchers.filter((v) => v.usedAt === null).length;

    return {
      totalVouchers,
      totalUsed,
      availableVouchers,
    };
  }

  async getUserExchangeHistory(
    userProfileId: string,
  ): Promise<UserLocationVoucherExchangeHistoryEntity[]> {
    return this.userLocationVoucherExchangeHistoryRepository.findByUser(
      userProfileId,
    );
  }

  async useVoucher(
    userProfileId: string,
    exchangeHistoryId: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const exchangeRecord =
        await this.userLocationVoucherExchangeHistoryRepository.repo.findOne({
          where: { id: exchangeHistoryId, userProfileId },
          relations: ['voucher'],
        });

      if (!exchangeRecord) {
        return {
          success: false,
          message: 'Voucher not found or does not belong to you',
        };
      }

      // Check if already used
      if (exchangeRecord.usedAt !== null) {
        return {
          success: false,
          message: 'This voucher has already been used',
        };
      }

      // Check if voucher is still valid
      const now = new Date();
      if (now > exchangeRecord.voucher.endDate) {
        return {
          success: false,
          message: 'This voucher has expired',
        };
      }

      // Mark as used
      exchangeRecord.usedAt = now;
      await this.userLocationVoucherExchangeHistoryRepository.repo.save(
        exchangeRecord,
      );

      return {
        success: true,
        message: `Successfully used voucher: ${exchangeRecord.voucher.title}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Usage failed: ${error.message}`,
      };
    }
  }

  async useVoucherByCode(userVoucherCode: string): Promise<{
    success: boolean;
    message: string;
    voucher?: UserLocationVoucherExchangeHistoryEntity;
  }> {
    try {
      // Find voucher by unique code
      const exchangeRecord =
        await this.userLocationVoucherExchangeHistoryRepository.findByUserVoucherCode(
          userVoucherCode,
        );

      if (!exchangeRecord) {
        return {
          success: false,
          message: 'Voucher code not found',
        };
      }

      // Check if already used
      if (exchangeRecord.usedAt !== null) {
        return {
          success: false,
          message: 'This voucher has already been used',
        };
      }

      // Check if voucher is still valid
      const now = new Date();
      if (now > exchangeRecord.voucher.endDate) {
        return {
          success: false,
          message: 'This voucher has expired',
        };
      }

      // Mark as used
      exchangeRecord.usedAt = now;
      await this.userLocationVoucherExchangeHistoryRepository.repo.save(
        exchangeRecord,
      );

      return {
        success: true,
        message: `Successfully used voucher: ${exchangeRecord.voucher.title}`,
        voucher: exchangeRecord,
      };
    } catch (error) {
      return {
        success: false,
        message: `Usage failed: ${error.message}`,
      };
    }
  }
}
