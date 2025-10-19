import { TypeOrmModule } from '@nestjs/typeorm';
import { RewardPointEntity } from '../domain/RewardPoint.entity';
import { RankEntity } from '../domain/Rank.entity';
import { Module } from '@nestjs/common';
import { RewardPointRepository } from './repository/RewardPoint.repository';
import { RankRepository } from './repository/Rank.repository';

const repositories = [RewardPointRepository, RankRepository];

@Module({
  imports: [TypeOrmModule.forFeature([RewardPointEntity, RankEntity])],
  providers: repositories,
  exports: repositories,
})
export class GamificationInfraModule {}
