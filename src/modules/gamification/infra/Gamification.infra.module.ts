import { TypeOrmModule } from '@nestjs/typeorm';
import { RewardPointEntity } from '../domain/RewardPoint.entity';
import { RankEntity } from '../domain/Rank.entity';
import { PointsHistoryEntity } from '../domain/PointsHistory.entity';
import { Module } from '@nestjs/common';
import { RewardPointRepository } from './repository/RewardPoint.repository';
import { RankRepository } from './repository/Rank.repository';
import { PointsHistoryRepository } from './repository/PointsHistory.repository';

const repositories = [
  RewardPointRepository,
  RankRepository,
  PointsHistoryRepository,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RewardPointEntity,
      RankEntity,
      PointsHistoryEntity,
    ]),
  ],
  providers: repositories,
  exports: repositories,
})
export class GamificationInfraModule {}
