import { LeaderboardPeriodType } from '@/modules/gamification/domain/LeaderboardSnapshot.entity';

export const ILeaderboardSnapshotService = Symbol(
  'ILeaderboardSnapshotService',
);

export interface ILeaderboardSnapshotService {
  /**
   * Calculate and save leaderboard snapshot for a specific period
   */
  calculateAndSaveSnapshot(
    periodType: LeaderboardPeriodType,
    periodValue?: string,
  ): Promise<void>;

  /**
   * Calculate and save snapshots for all period types (monthly, yearly, seasonal)
   */
  calculateAllSnapshots(): Promise<void>;

  /**
   * Get leaderboard snapshot for a specific period
   */
  getLeaderboardSnapshot(
    periodType: LeaderboardPeriodType,
    periodValue: string,
    limit?: number,
  ): Promise<any[]>;
}
