import { Injectable, Logger } from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import { ILeaderboardSnapshotService } from '../ILeaderboardSnapshot.service';
import {
  LeaderboardPeriodType,
  LeaderboardSnapshotEntity,
} from '@/modules/gamification/domain/LeaderboardSnapshot.entity';
import { LeaderboardPeriodHelper } from '../helper/LeaderboardPeriod.helper';
import { UserProfileRepository } from '@/modules/account/infra/repository/UserProfile.repository';
import { LeaderboardSnapshotRepository } from '@/modules/gamification/infra/repository/LeaderboardSnapshot.repository';

@Injectable()
export class LeaderboardSnapshotService
  extends CoreService
  implements ILeaderboardSnapshotService
{
  private readonly logger = new Logger(LeaderboardSnapshotService.name);

  constructor(
    private readonly userProfileRepository: UserProfileRepository,
    private readonly leaderboardSnapshotRepository: LeaderboardSnapshotRepository,
  ) {
    super();
  }

  async calculateAndSaveSnapshot(
    periodType: LeaderboardPeriodType,
    periodValue?: string,
  ): Promise<void> {
    const period =
      periodValue || LeaderboardPeriodHelper.getPeriodValue(periodType);

    this.logger.log(
      `Calculating leaderboard snapshot for ${periodType} period: ${period}`,
    );

    return this.ensureTransaction(null, async (manager) => {
      const userProfileRepo = manager.getRepository(
        this.userProfileRepository.repo.target,
      );
      const snapshotRepo = manager.getRepository(
        this.leaderboardSnapshotRepository.repo.target,
      );

      // Get all user profiles sorted by ranking_point (highest first)
      const userProfiles = await userProfileRepo
        .createQueryBuilder('userProfile')
        .leftJoin('userProfile.account', 'account')
        .where('account.role = :role', { role: 'user' })
        .select(['userProfile.accountId', 'userProfile.rankingPoint'])
        .orderBy('userProfile.ranking_point', 'DESC')
        .getMany();

      if (userProfiles.length === 0) {
        this.logger.warn('No user profiles found for leaderboard snapshot');
        return;
      }

      // Delete existing snapshots for this period
      await snapshotRepo.delete({
        periodType,
        periodValue: period,
      });

      // Create new snapshots with rank positions
      const snapshots: LeaderboardSnapshotEntity[] = userProfiles.map(
        (profile, index) => {
          const snapshot = new LeaderboardSnapshotEntity();
          snapshot.periodType = periodType;
          snapshot.periodValue = period;
          snapshot.userId = profile.accountId;
          snapshot.rankingPoint = profile.rankingPoint;
          snapshot.rankPosition = index + 1; // 1-based ranking
          return snapshot;
        },
      );

      await snapshotRepo.save(snapshots);

      this.logger.log(
        `✅ Saved ${snapshots.length} leaderboard snapshots for ${periodType} period: ${period}`,
      );
    });
  }

  async calculateAllSnapshots(): Promise<void> {
    this.logger.log('Calculating all leaderboard snapshots...');

    await Promise.all([
      this.calculateAndSaveSnapshot(LeaderboardPeriodType.WEEKLY),
      this.calculateAndSaveSnapshot(LeaderboardPeriodType.MONTHLY),
      this.calculateAndSaveSnapshot(LeaderboardPeriodType.YEARLY),
      this.calculateAndSaveSnapshot(LeaderboardPeriodType.SEASONAL),
    ]);

    this.logger.log('✅ All leaderboard snapshots calculated');
  }

  async getLeaderboardSnapshot(
    periodType: LeaderboardPeriodType,
    periodValue: string,
    limit: number = 100,
  ): Promise<any[]> {
    const snapshots = await this.leaderboardSnapshotRepository.repo
      .createQueryBuilder('snapshot')
      .leftJoin('snapshot.userProfile', 'userProfile')
      .leftJoin('userProfile.account', 'account')
      .where('snapshot.periodType = :periodType', { periodType })
      .andWhere('snapshot.periodValue = :periodValue', { periodValue })
      .select([
        'snapshot.userId',
        'snapshot.rankingPoint',
        'snapshot.rankPosition',
        'account.firstName',
        'account.lastName',
        'account.avatarUrl',
      ])
      .orderBy('snapshot.rankPosition', 'ASC')
      .limit(limit)
      .getRawMany();

    return snapshots.map((snapshot) => ({
      userId: snapshot.snapshot_userId,
      firstName: snapshot.account_firstName || '',
      lastName: snapshot.account_lastName || '',
      avatarUrl: snapshot.account_avatarUrl || null,
      rankingPoint: snapshot.snapshot_rankingPoint,
      rank: snapshot.snapshot_rankPosition,
    }));
  }
}
