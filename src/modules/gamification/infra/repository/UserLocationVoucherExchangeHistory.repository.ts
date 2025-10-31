import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserLocationVoucherExchangeHistoryEntity } from '../../domain/UserLocationVoucherExchangeHistory.entity';

@Injectable()
export class UserLocationVoucherExchangeHistoryRepository {
  public readonly repo: Repository<UserLocationVoucherExchangeHistoryEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.repo = this.dataSource.getRepository(
      UserLocationVoucherExchangeHistoryEntity,
    );
  }

  async findByUser(
    userProfileId: string,
  ): Promise<UserLocationVoucherExchangeHistoryEntity[]> {
    return this.repo.find({
      where: { userProfileId },
      relations: ['voucher'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByLocation(
    locationId: string,
  ): Promise<UserLocationVoucherExchangeHistoryEntity[]> {
    return this.repo
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.voucher', 'voucher')
      .where('voucher.locationId = :locationId', { locationId })
      .orderBy('history.createdAt', 'DESC')
      .getMany();
  }

  async findByUserAndLocation(
    userProfileId: string,
    locationId: string,
  ): Promise<UserLocationVoucherExchangeHistoryEntity[]> {
    return this.repo
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.voucher', 'voucher')
      .where('history.userProfileId = :userProfileId', { userProfileId })
      .andWhere('voucher.locationId = :locationId', { locationId })
      .orderBy('history.createdAt', 'DESC')
      .getMany();
  }

  async createExchangeHistory(
    userProfileId: string,
    voucherId: string,
    pointSpent: number,
  ): Promise<UserLocationVoucherExchangeHistoryEntity> {
    const history = this.repo.create({
      userProfileId,
      voucherId,
      pointSpent,
    });

    return this.repo.save(history);
  }

  async getUserExchangeStats(userProfileId: string): Promise<{
    totalExchanges: number;
    totalPointsSpent: number;
    exchangesByLocation: Array<{
      locationId: string;
      locationName: string;
      exchangeCount: number;
      pointsSpent: number;
    }>;
  }> {
    const histories = await this.findByUser(userProfileId);

    const totalExchanges = histories.length;
    const totalPointsSpent = histories.reduce(
      (sum, h) => sum + h.pointSpent,
      0,
    );

    // Group by location
    const locationMap = new Map<
      string,
      {
        locationName: string;
        exchangeCount: number;
        pointsSpent: number;
      }
    >();

    histories.forEach((history) => {
      const locationId = history.voucher.locationId;
      const locationName = history.voucher.location?.name || 'Unknown Location';

      if (!locationMap.has(locationId)) {
        locationMap.set(locationId, {
          locationName,
          exchangeCount: 0,
          pointsSpent: 0,
        });
      }

      const locationStats = locationMap.get(locationId)!;
      locationStats.exchangeCount += 1;
      locationStats.pointsSpent += history.pointSpent;
    });

    const exchangesByLocation = Array.from(locationMap.entries()).map(
      ([locationId, stats]) => ({
        locationId,
        ...stats,
      }),
    );

    return {
      totalExchanges,
      totalPointsSpent,
      exchangesByLocation,
    };
  }
}
