import { Injectable } from '@nestjs/common';
import { UserLocationVoucherRepository } from '../../infra/repository/UserLocationVoucher.repository';
import { UserLocationVoucherExchangeHistoryRepository } from '../../infra/repository/UserLocationVoucherExchangeHistory.repository';
import { UserLocationVoucherUsageRepository } from '../../infra/repository/UserLocationVoucherUsage.repository';
import { UserLocationProfileRepository } from '@/modules/gamification/infra/repository/UserLocationProfile.repository';
import { LocationVoucherRepository } from '../../infra/repository/LocationVoucher.repository';
import { UserLocationVoucherEntity } from '../../domain/UserLocationVoucher.entity';
import { UserLocationVoucherExchangeHistoryEntity } from '../../domain/UserLocationVoucherExchangeHistory.entity';
import { UserLocationVoucherUsageEntity } from '../../domain/UserLocationVoucherUsage.entity';
import { AvailableVoucherResponseDto } from '@/common/dto/gamification/AvailableVoucher.response.dto';

export interface IVoucherExchangeService {
  exchangeVoucher(
    userProfileId: string,
    voucherId: string,
  ): Promise<{
    success: boolean;
    message: string;
    userVoucher?: UserLocationVoucherEntity;
    exchangeHistory?: UserLocationVoucherExchangeHistoryEntity;
  }>;

  getUserVouchers(userProfileId: string): Promise<UserLocationVoucherEntity[]>;

  getUserVoucherStats(userProfileId: string): Promise<{
    totalVouchers: number;
    totalUsed: number;
    availableVouchers: number;
  }>;

  getUserExchangeHistory(
    userProfileId: string,
  ): Promise<UserLocationVoucherExchangeHistoryEntity[]>;

  getUserUsageHistory(
    userProfileId: string,
  ): Promise<UserLocationVoucherUsageEntity[]>;

  useVoucher(
    userProfileId: string,
    userVoucherId: string,
  ): Promise<{
    success: boolean;
    message: string;
    usage?: UserLocationVoucherUsageEntity;
  }>;
}

@Injectable()
export class VoucherExchangeService implements IVoucherExchangeService {
  constructor(
    private readonly userLocationVoucherRepository: UserLocationVoucherRepository,
    private readonly userLocationVoucherExchangeHistoryRepository: UserLocationVoucherExchangeHistoryRepository,
    private readonly userLocationVoucherUsageRepository: UserLocationVoucherUsageRepository,
    private readonly userLocationProfileRepository: UserLocationProfileRepository,
    private readonly locationVoucherRepository: LocationVoucherRepository,
  ) {}

  async exchangeVoucher(
    userProfileId: string,
    voucherId: string,
  ): Promise<{
    success: boolean;
    message: string;
    userVoucher?: UserLocationVoucherEntity;
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
      const existingUserVoucher =
        await this.userLocationVoucherRepository.findByUserAndVoucher(
          userProfileId,
          voucherId,
        );

      if (existingUserVoucher) {
        // Check if user has reached the redemption limit
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

      // Create or get existing user voucher
      let userVoucher = existingUserVoucher;
      if (!userVoucher) {
        userVoucher =
          await this.userLocationVoucherRepository.createUserVoucher(
            userProfileId,
            voucherId,
          );
      }

      // Create exchange history
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
        userVoucher,
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
  ): Promise<UserLocationVoucherEntity[]> {
    return this.userLocationVoucherRepository.findByUser(userProfileId);
  }

  async getUserVoucherStats(userProfileId: string): Promise<{
    totalVouchers: number;
    totalUsed: number;
    availableVouchers: number;
  }> {
    return this.userLocationVoucherRepository.getUserVoucherStats(
      userProfileId,
    );
  }

  async getUserExchangeHistory(
    userProfileId: string,
  ): Promise<UserLocationVoucherExchangeHistoryEntity[]> {
    return this.userLocationVoucherExchangeHistoryRepository.findByUser(
      userProfileId,
    );
  }

  async getUserUsageHistory(
    userProfileId: string,
  ): Promise<UserLocationVoucherUsageEntity[]> {
    return this.userLocationVoucherUsageRepository.findByUser(userProfileId);
  }

  async useVoucher(
    userProfileId: string,
    userVoucherId: string,
  ): Promise<{
    success: boolean;
    message: string;
    usage?: UserLocationVoucherUsageEntity;
  }> {
    try {
      // Get user voucher
      const userVoucher = await this.userLocationVoucherRepository.repo.findOne(
        {
          where: { id: userVoucherId, userProfileId },
          relations: ['voucher'],
        },
      );

      if (!userVoucher) {
        return {
          success: false,
          message: 'Voucher not found or does not belong to you',
        };
      }

      // Check if voucher is still valid
      const now = new Date();
      if (now > userVoucher.voucher.endDate) {
        return {
          success: false,
          message: 'This voucher has expired',
        };
      }

      // Create usage record
      const usage = await this.userLocationVoucherUsageRepository.createUsage(
        userVoucherId,
        userProfileId,
      );

      // Increment usage count
      await this.userLocationVoucherRepository.incrementUsage(
        userProfileId,
        userVoucher.voucherId,
      );

      return {
        success: true,
        message: `Successfully used voucher: ${userVoucher.voucher.title}`,
        usage,
      };
    } catch (error) {
      return {
        success: false,
        message: `Usage failed: ${error.message}`,
      };
    }
  }
}
