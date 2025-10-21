import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IUserPointsService } from '../IUserPoints.service';
import { UserProfileRepository } from '@/modules/account/infra/repository/UserProfile.repository';
import { RankRepository } from '@/modules/gamification/infra/repository/Rank.repository';
import { DataSource } from 'typeorm';

@Injectable()
export class UserPointsService implements IUserPointsService {
  private readonly logger = new Logger(UserPointsService.name);

  constructor(
    private readonly userProfileRepository: UserProfileRepository,
    private readonly rankRepository: RankRepository,
    private readonly dataSource: DataSource,
  ) {}

  async addPoints(userId: string, points: number): Promise<void> {
    this.logger.debug(
      `🎯 Attempting to add ${points} points to user ${userId}`,
    );

    await this.dataSource.transaction(async (manager) => {
      const userProfileRepo = manager.getRepository(
        this.userProfileRepository.repo.target,
      );

      const userProfile = await userProfileRepo.findOne({
        where: { accountId: userId },
      });

      if (!userProfile) {
        this.logger.warn(
          `⚠️ User profile not found for userId: ${userId}. User may not have onboarded yet.`,
        );
        return;
      }

      this.logger.debug(
        `✓ Found user profile. Current points: ${userProfile.points}, Ranking points: ${userProfile.rankingPoint}`,
      );

      // Update both points (for redeeming) and ranking points (for ranking)
      const oldPoints = userProfile.points;
      const oldRankingPoint = userProfile.rankingPoint;
      userProfile.points += points;
      userProfile.rankingPoint += points;

      this.logger.debug(
        `💾 Saving user profile with new points: ${oldPoints} + ${points} = ${userProfile.points}, Ranking: ${oldRankingPoint} + ${points} = ${userProfile.rankingPoint}`,
      );

      await userProfileRepo.save(userProfile);

      this.logger.log(
        `✅ Added ${points} points to user ${userId}. Points: ${oldPoints} → ${userProfile.points}, Ranking: ${oldRankingPoint} → ${userProfile.rankingPoint}`,
      );

      // Update rank based on ranking points (within same transaction)
      await this.updateUserRankInTransaction(
        userId,
        userProfile.rankingPoint,
        manager,
      );
    });
  }

  async updateUserRank(userId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const userProfileRepo = manager.getRepository(
        this.userProfileRepository.repo.target,
      );

      const userProfile = await userProfileRepo.findOne({
        where: { accountId: userId },
      });

      if (!userProfile) {
        throw new NotFoundException('User profile not found');
      }

      await this.updateUserRankInTransaction(
        userId,
        userProfile.rankingPoint,
        manager,
      );
    });
  }

  private async updateUserRankInTransaction(
    userId: string,
    currentPoints: number,
    manager: any,
  ): Promise<void> {
    const userProfileRepo = manager.getRepository(
      this.userProfileRepository.repo.target,
    );
    const rankRepo = manager.getRepository(this.rankRepository.repo.target);

    const userProfile = await userProfileRepo.findOne({
      where: { accountId: userId },
    });

    if (!userProfile) {
      this.logger.warn(`User profile not found for userId: ${userId}`);
      return;
    }

    // Find appropriate rank based on current points
    const appropriateRank = await rankRepo
      .createQueryBuilder('rank')
      .where('rank.min_points <= :points', { points: currentPoints })
      .andWhere('(rank.max_points IS NULL OR rank.max_points >= :points)', {
        points: currentPoints,
      })
      .orderBy('rank.min_points', 'DESC')
      .getOne();

    if (!appropriateRank) {
      this.logger.warn(`No appropriate rank found for ${currentPoints} points`);
      return;
    }

    // Update rank if changed
    if (userProfile.rankId !== appropriateRank.id) {
      const oldRankId = userProfile.rankId;
      userProfile.rankId = appropriateRank.id;
      await userProfileRepo.save(userProfile);

      this.logger.log(
        `Updated rank for user ${userId} from ${oldRankId} to ${appropriateRank.id} (${appropriateRank.name})`,
      );
    }
  }
}
