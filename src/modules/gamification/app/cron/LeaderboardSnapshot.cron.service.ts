import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ILeaderboardSnapshotService } from '../ILeaderboardSnapshot.service';
import { LeaderboardPeriodType } from '@/modules/gamification/domain/LeaderboardSnapshot.entity';

@Injectable()
export class LeaderboardSnapshotCronService implements OnModuleInit {
  private readonly logger = new Logger(LeaderboardSnapshotCronService.name);

  constructor(
    @Inject(ILeaderboardSnapshotService)
    private readonly leaderboardSnapshotService: ILeaderboardSnapshotService,
  ) {}

  onModuleInit() {
    this.logger.log('LeaderboardSnapshotCronService initialized');
  }

  /**
   * Calculate weekly leaderboard snapshot at the beginning of each week
   * Runs at 00:00:00 every Monday
   */
  @Cron('0 0 * * 1')
  async calculateWeeklySnapshot() {
    this.logger.log('Calculating weekly leaderboard snapshot...');
    try {
      await this.leaderboardSnapshotService.calculateAndSaveSnapshot(
        LeaderboardPeriodType.WEEKLY,
      );
      this.logger.log('✅ Weekly leaderboard snapshot calculated successfully');
    } catch (error) {
      this.logger.error(
        `Error calculating weekly leaderboard snapshot: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Calculate monthly leaderboard snapshot at the beginning of each month
   * Runs at 00:00:00 on the 1st day of every month
   */
  @Cron('0 0 1 * *')
  async calculateMonthlySnapshot() {
    this.logger.log('Calculating monthly leaderboard snapshot...');
    try {
      await this.leaderboardSnapshotService.calculateAndSaveSnapshot(
        LeaderboardPeriodType.MONTHLY,
      );
      this.logger.log(
        '✅ Monthly leaderboard snapshot calculated successfully',
      );
    } catch (error) {
      this.logger.error(
        `Error calculating monthly leaderboard snapshot: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Calculate yearly leaderboard snapshot at the beginning of each year
   * Runs at 00:00:00 on January 1st
   */
  @Cron('0 0 1 1 *')
  async calculateYearlySnapshot() {
    this.logger.log('Calculating yearly leaderboard snapshot...');
    try {
      await this.leaderboardSnapshotService.calculateAndSaveSnapshot(
        LeaderboardPeriodType.YEARLY,
      );
      this.logger.log('✅ Yearly leaderboard snapshot calculated successfully');
    } catch (error) {
      this.logger.error(
        `Error calculating yearly leaderboard snapshot: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Calculate seasonal leaderboard snapshot at the beginning of each season
   * Spring: March 1st, Summer: June 1st, Autumn: September 1st, Winter: December 1st
   */
  @Cron('0 0 1 3,6,9,12 *')
  async calculateSeasonalSnapshot() {
    this.logger.log('Calculating seasonal leaderboard snapshot...');
    try {
      await this.leaderboardSnapshotService.calculateAndSaveSnapshot(
        LeaderboardPeriodType.SEASONAL,
      );
      this.logger.log(
        '✅ Seasonal leaderboard snapshot calculated successfully',
      );
    } catch (error) {
      this.logger.error(
        `Error calculating seasonal leaderboard snapshot: ${error.message}`,
        error.stack,
      );
    }
  }
}
