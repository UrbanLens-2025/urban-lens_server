import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { OneTimeQRCodeEntity } from '../../domain/OneTimeQRCode.entity';

@Injectable()
export class OneTimeQRCodeRepository {
  public readonly repo: Repository<OneTimeQRCodeEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.repo = this.dataSource.getRepository(OneTimeQRCodeEntity);
  }

  async findValidQRCode(
    qrCodeData: string,
  ): Promise<OneTimeQRCodeEntity | null> {
    return this.repo.findOne({
      where: {
        qrCodeData,
        isUsed: false,
      },
      relations: ['scannedByUser', 'businessOwner'],
    });
  }

  async markAsUsed(id: string, scannedBy: string): Promise<void> {
    await this.repo.update(id, {
      isUsed: true,
      scannedBy,
      scannedAt: new Date(),
    });
  }

  async findExpiredCodes(): Promise<OneTimeQRCodeEntity[]> {
    return this.repo
      .createQueryBuilder('qr')
      .where('qr.expires_at < :now', { now: new Date() })
      .andWhere('qr.is_used = false')
      .getMany();
  }

  async cleanupExpiredCodes(): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .delete()
      .where('expires_at < :now', { now: new Date() })
      .andWhere('is_used = false')
      .execute();
  }

  async findScannedByUser(userId: string): Promise<OneTimeQRCodeEntity[]> {
    return this.repo.find({
      where: { scannedBy: userId, isUsed: true },
      relations: ['location'],
      order: { scannedAt: 'DESC' },
    });
  }

  async findScannedAtBusinessLocations(
    businessOwnerId: string,
  ): Promise<OneTimeQRCodeEntity[]> {
    return this.repo.find({
      where: { businessOwnerId, isUsed: true },
      relations: ['scannedByUser', 'scannedByUser.account', 'location'],
      order: { scannedAt: 'DESC' },
    });
  }
}
