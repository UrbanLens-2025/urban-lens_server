import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserLocationVoucherEntity } from '../../domain/UserLocationVoucher.entity';

@Injectable()
export class UserLocationVoucherRepository {
  public readonly repo: Repository<UserLocationVoucherEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.repo = this.dataSource.getRepository(UserLocationVoucherEntity);
  }

  async findByUser(
    userProfileId: string,
  ): Promise<UserLocationVoucherEntity[]> {
    return this.repo.find({
      where: { userProfileId },
      relations: ['voucher'],
    });
  }

  async findByUserAndVoucher(
    userProfileId: string,
    voucherId: string,
  ): Promise<UserLocationVoucherEntity | null> {
    return this.repo.findOne({
      where: { userProfileId, voucherId },
      relations: ['voucher'],
    });
  }

  async findByLocation(
    locationId: string,
  ): Promise<UserLocationVoucherEntity[]> {
    return this.repo
      .createQueryBuilder('userVoucher')
      .leftJoinAndSelect('userVoucher.voucher', 'voucher')
      .where('voucher.locationId = :locationId', { locationId })
      .getMany();
  }

  async createUserVoucher(
    userProfileId: string,
    voucherId: string,
  ): Promise<UserLocationVoucherEntity> {
    const userVoucher = this.repo.create({
      userProfileId,
      voucherId,
      usedCount: 0,
    });

    return this.repo.save(userVoucher);
  }

  async incrementUsage(
    userProfileId: string,
    voucherId: string,
  ): Promise<UserLocationVoucherEntity | null> {
    const userVoucher = await this.findByUserAndVoucher(
      userProfileId,
      voucherId,
    );

    if (!userVoucher) {
      return null;
    }

    userVoucher.usedCount += 1;
    return this.repo.save(userVoucher);
  }

  async getUserVoucherStats(userProfileId: string): Promise<{
    totalVouchers: number;
    totalUsed: number;
    availableVouchers: number;
  }> {
    const vouchers = await this.findByUser(userProfileId);

    const totalVouchers = vouchers.length;
    const totalUsed = vouchers.reduce((sum, v) => sum + v.usedCount, 0);
    const availableVouchers = vouchers.filter((v) => v.usedCount === 0).length;

    return {
      totalVouchers,
      totalUsed,
      availableVouchers,
    };
  }
}
