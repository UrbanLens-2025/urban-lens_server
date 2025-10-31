import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserLocationVoucherUsageEntity } from '../../domain/UserLocationVoucherUsage.entity';

@Injectable()
export class UserLocationVoucherUsageRepository {
  public readonly repo: Repository<UserLocationVoucherUsageEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.repo = this.dataSource.getRepository(UserLocationVoucherUsageEntity);
  }

  async findByUser(
    userProfileId: string,
  ): Promise<UserLocationVoucherUsageEntity[]> {
    return this.repo.find({
      where: { userProfileId },
      relations: ['userLocationVoucher', 'userLocationVoucher.voucher'],
      order: { usedAt: 'DESC' },
    });
  }

  async findByUserLocationVoucher(
    userLocationVoucherId: string,
  ): Promise<UserLocationVoucherUsageEntity[]> {
    return this.repo.find({
      where: { userLocationVoucherId },
      relations: ['userProfile'],
      order: { usedAt: 'DESC' },
    });
  }

  async findByLocation(
    locationId: string,
  ): Promise<UserLocationVoucherUsageEntity[]> {
    return this.repo
      .createQueryBuilder('usage')
      .leftJoinAndSelect('usage.userLocationVoucher', 'userVoucher')
      .leftJoinAndSelect('userVoucher.voucher', 'voucher')
      .leftJoinAndSelect('usage.userProfile', 'userProfile')
      .where('voucher.locationId = :locationId', { locationId })
      .orderBy('usage.usedAt', 'DESC')
      .getMany();
  }

  async createUsage(
    userLocationVoucherId: string,
    userProfileId: string,
  ): Promise<UserLocationVoucherUsageEntity> {
    const usage = this.repo.create({
      userLocationVoucherId,
      userProfileId,
      usedAt: new Date(),
    });

    return this.repo.save(usage);
  }

  async getUserUsageStats(userProfileId: string): Promise<{
    totalUsages: number;
    usagesByLocation: Array<{
      locationId: string;
      locationName: string;
      usageCount: number;
    }>;
  }> {
    const usages = await this.findByUser(userProfileId);

    const totalUsages = usages.length;

    // Group by location
    const locationMap = new Map<
      string,
      {
        locationName: string;
        usageCount: number;
      }
    >();

    usages.forEach((usage) => {
      const locationId = usage.userLocationVoucher.voucher.locationId;
      const locationName =
        usage.userLocationVoucher.voucher.location?.name || 'Unknown Location';

      if (!locationMap.has(locationId)) {
        locationMap.set(locationId, {
          locationName,
          usageCount: 0,
        });
      }

      const locationStats = locationMap.get(locationId)!;
      locationStats.usageCount += 1;
    });

    const usagesByLocation = Array.from(locationMap.entries()).map(
      ([locationId, stats]) => ({
        locationId,
        ...stats,
      }),
    );

    return {
      totalUsages,
      usagesByLocation,
    };
  }

  async getLocationUsageStats(locationId: string): Promise<{
    totalUsages: number;
    uniqueUsers: number;
    usageByVoucher: Array<{
      voucherId: string;
      voucherName: string;
      usageCount: number;
    }>;
  }> {
    const usages = await this.findByLocation(locationId);

    const totalUsages = usages.length;
    const uniqueUsers = new Set(usages.map((u) => u.userProfileId)).size;

    // Group by voucher
    const voucherMap = new Map<
      string,
      {
        voucherName: string;
        usageCount: number;
      }
    >();

    usages.forEach((usage) => {
      const voucherId = usage.userLocationVoucher.voucherId;
      const voucherName = usage.userLocationVoucher.voucher.title;

      if (!voucherMap.has(voucherId)) {
        voucherMap.set(voucherId, {
          voucherName,
          usageCount: 0,
        });
      }

      const voucherStats = voucherMap.get(voucherId)!;
      voucherStats.usageCount += 1;
    });

    const usageByVoucher = Array.from(voucherMap.entries()).map(
      ([voucherId, stats]) => ({
        voucherId,
        ...stats,
      }),
    );

    return {
      totalUsages,
      uniqueUsers,
      usageByVoucher,
    };
  }
}
