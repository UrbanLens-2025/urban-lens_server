import { TypeOrmModule } from '@nestjs/typeorm';
import { RewardPointEntity } from '../domain/RewardPoint.entity';
import { RankEntity } from '../domain/Rank.entity';
import { PointsHistoryEntity } from '../domain/PointsHistory.entity';
import { LocationMissionEntity } from '../domain/LocationMission.entity';
import { LocationVoucherEntity } from '../domain/LocationVoucher.entity';
import { UserMissionProgressEntity } from '../domain/UserMissionProgress.entity';
import { LocationMissionLogEntity } from '../domain/LocationMissionLog.entity';
import { OneTimeQRCodeEntity } from '../domain/OneTimeQRCode.entity';
import { UserLocationProfileEntity } from '../domain/UserLocationProfile.entity';
import { UserLocationVoucherEntity } from '../domain/UserLocationVoucher.entity';
import { UserLocationVoucherExchangeHistoryEntity } from '../domain/UserLocationVoucherExchangeHistory.entity';
import { UserLocationVoucherUsageEntity } from '../domain/UserLocationVoucherUsage.entity';
import { Module } from '@nestjs/common';
import { RewardPointRepository } from './repository/RewardPoint.repository';
import { RankRepository } from './repository/Rank.repository';
import { PointsHistoryRepository } from './repository/PointsHistory.repository';
import { LocationMissionRepository } from './repository/LocationMission.repository';
import { LocationVoucherRepository } from './repository/LocationVoucher.repository';
import { UserMissionProgressRepository } from './repository/UserMissionProgress.repository';
import { LocationMissionLogRepository } from './repository/LocationMissionLog.repository';
import { OneTimeQRCodeRepository } from './repository/OneTimeQRCode.repository';
import { UserLocationProfileRepository } from './repository/UserLocationProfile.repository';
import { UserLocationVoucherRepository } from './repository/UserLocationVoucher.repository';
import { UserLocationVoucherExchangeHistoryRepository } from './repository/UserLocationVoucherExchangeHistory.repository';
import { UserLocationVoucherUsageRepository } from './repository/UserLocationVoucherUsage.repository';

const repositories = [
  RewardPointRepository,
  RankRepository,
  PointsHistoryRepository,
  LocationMissionRepository,
  LocationVoucherRepository,
  UserMissionProgressRepository,
  LocationMissionLogRepository,
  OneTimeQRCodeRepository,
  UserLocationProfileRepository,
  UserLocationVoucherRepository,
  UserLocationVoucherExchangeHistoryRepository,
  UserLocationVoucherUsageRepository,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RewardPointEntity,
      RankEntity,
      PointsHistoryEntity,
      LocationMissionEntity,
      LocationVoucherEntity,
      UserMissionProgressEntity,
      LocationMissionLogEntity,
      OneTimeQRCodeEntity,
      UserLocationProfileEntity,
      UserLocationVoucherEntity,
      UserLocationVoucherExchangeHistoryEntity,
      UserLocationVoucherUsageEntity,
    ]),
  ],
  providers: repositories,
  exports: repositories,
})
export class GamificationInfraModule {}
