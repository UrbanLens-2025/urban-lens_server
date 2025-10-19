import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserProfileRepository } from '@/modules/account/infra/repository/UserProfile.repository';
import { RewardPointRepository } from '@/modules/gamification/infra/repository/RewardPoint.repository';
import { RewardPointType } from '@/modules/gamification/domain/RewardPoint.entity';
import { PostRepository } from '@/modules/post/infra/repository/Post.repository';
import { CommentRepository } from '@/modules/post/infra/repository/Comment.repository';
import { ReactRepository } from '@/modules/post/infra/repository/React.repository';
import { CheckInRepository } from '@/modules/business/infra/repository/CheckIn.repository';
import { PostType } from '@/modules/post/domain/Post.entity';
import { ReactEntityType } from '@/modules/post/domain/React.entity';
import { IUserPointsService } from '../IUserPoints.service';
import { Inject } from '@nestjs/common';

@Injectable()
export class PointsRecalculationService {
  private readonly logger = new Logger(PointsRecalculationService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly userProfileRepository: UserProfileRepository,
    private readonly rewardPointRepository: RewardPointRepository,
    private readonly postRepository: PostRepository,
    private readonly commentRepository: CommentRepository,
    private readonly reactRepository: ReactRepository,
    private readonly checkInRepository: CheckInRepository,
    @Inject(IUserPointsService)
    private readonly userPointsService: IUserPointsService,
  ) {}

  /**
   * Recalculate points for a specific user based on their activities
   */
  async recalculateUserPoints(userId: string): Promise<{
    oldPoints: number;
    newPoints: number;
    breakdown: Record<string, number>;
  }> {
    return await this.dataSource.transaction(async (manager) => {
      const userProfileRepo = manager.getRepository(
        this.userProfileRepository.repo.target,
      );
      const postRepo = manager.getRepository(this.postRepository.repo.target);
      const commentRepo = manager.getRepository(
        this.commentRepository.repo.target,
      );
      const reactRepo = manager.getRepository(this.reactRepository.repo.target);
      const checkInRepo = manager.getRepository(
        this.checkInRepository.repo.target,
      );

      // Get user profile
      const userProfile = await userProfileRepo.findOne({
        where: { accountId: userId },
      });

      if (!userProfile) {
        throw new Error(`User profile not found for userId: ${userId}`);
      }

      const oldPoints = userProfile.points;

      // Get all reward points
      const rewardPoints = await this.rewardPointRepository.repo.find();
      const rewardPointsMap = new Map(
        rewardPoints.map((rp) => [rp.type, rp.points]),
      );

      // Count user's activities
      const [blogCount, reviewCount, commentCount, reactCount, checkInCount] =
        await Promise.all([
          // Count blogs
          postRepo.count({
            where: { authorId: userId, type: PostType.BLOG },
          }),
          // Count reviews
          postRepo.count({
            where: { authorId: userId, type: PostType.REVIEW },
          }),
          // Count comments - use query builder since Comment doesn't have authorId column
          commentRepo
            .createQueryBuilder('comment')
            .where('comment.author_id = :userId', { userId })
            .getCount(),
          // Count reactions (upvotes/downvotes on posts)
          reactRepo.count({
            where: { authorId: userId, entityType: ReactEntityType.POST },
          }),
          // Count check-ins
          checkInRepo.count({
            where: { userProfileId: userId },
          }),
        ]);

      // Calculate points for each activity
      const breakdown: Record<string, number> = {
        blogs:
          blogCount * (rewardPointsMap.get(RewardPointType.CREATE_BLOG) || 0),
        reviews:
          reviewCount *
          (rewardPointsMap.get(RewardPointType.CREATE_REVIEW) || 0),
        comments:
          commentCount *
          (rewardPointsMap.get(RewardPointType.CREATE_COMMENT) || 0),
        reactions:
          reactCount *
          (rewardPointsMap.get(RewardPointType.UPVOTE_DOWNVOTE) || 0),
        checkIns:
          checkInCount * (rewardPointsMap.get(RewardPointType.CHECK_IN) || 0),
      };

      // Calculate total points
      const newPoints = Object.values(breakdown).reduce(
        (sum, points) => sum + points,
        0,
      );

      // Update user points
      userProfile.points = newPoints;
      await userProfileRepo.save(userProfile);

      this.logger.log(
        `Recalculated points for user ${userId}: ${oldPoints} → ${newPoints}`,
      );

      // Update rank
      await this.userPointsService.updateUserRank(userId);

      return {
        oldPoints,
        newPoints,
        breakdown,
      };
    });
  }

  /**
   * Recalculate points for all users in the system
   */
  async recalculateAllUsersPoints(): Promise<{
    totalUsers: number;
    updated: number;
    errors: number;
  }> {
    const userProfiles = await this.userProfileRepository.repo.find({
      select: ['accountId'],
    });

    this.logger.log(
      `Starting recalculation for ${userProfiles.length} users...`,
    );

    let updated = 0;
    let errors = 0;

    for (const profile of userProfiles) {
      try {
        await this.recalculateUserPoints(profile.accountId);
        updated++;

        if (updated % 100 === 0) {
          this.logger.log(`Progress: ${updated}/${userProfiles.length} users`);
        }
      } catch (error) {
        this.logger.error(
          `Error recalculating points for user ${profile.accountId}: ${error.message}`,
        );
        errors++;
      }
    }

    this.logger.log(
      `Recalculation completed: ${updated} updated, ${errors} errors`,
    );

    return {
      totalUsers: userProfiles.length,
      updated,
      errors,
    };
  }
}
