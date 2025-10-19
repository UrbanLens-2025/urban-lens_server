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
    await this.dataSource.transaction(async (manager) => {
      const userProfileRepo = manager.getRepository(
        this.userProfileRepository.repo.target,
      );

      const userProfile = await userProfileRepo.findOne({
        where: { accountId: userId },
      });

      if (!userProfile) {
        this.logger.warn(`User profile not found for userId: ${userId}`);
        return;
      }

      // Update points
      userProfile.points += points;
      await userProfileRepo.save(userProfile);

      this.logger.log(
        `Added ${points} points to user ${userId}. New total: ${userProfile.points}`,
      );

      // Update rank if necessary
      await this.updateUserRank(userId);
    });
  }

  async updateUserRank(userId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const userProfileRepo = manager.getRepository(
        this.userProfileRepository.repo.target,
      );
      const rankRepo = manager.getRepository(this.rankRepository.repo.target);

      const userProfile = await userProfileRepo.findOne({
        where: { accountId: userId },
      });

      if (!userProfile) {
        throw new NotFoundException('User profile not found');
      }

      // Find appropriate rank based on current points
      const appropriateRank = await rankRepo
        .createQueryBuilder('rank')
        .where('rank.min_points <= :points', { points: userProfile.points })
        .andWhere('(rank.max_points IS NULL OR rank.max_points >= :points)', {
          points: userProfile.points,
        })
        .orderBy('rank.min_points', 'DESC')
        .getOne();

      if (!appropriateRank) {
        this.logger.warn(
          `No appropriate rank found for ${userProfile.points} points`,
        );
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
    });
  }
}
