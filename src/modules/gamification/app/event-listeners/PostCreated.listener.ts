import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  POST_CREATED_EVENT,
  PostCreatedEvent,
} from '@/modules/gamification/domain/events/PostCreated.event';
import { IUserPointsService } from '../IUserPoints.service';
import { RewardPointRepository } from '@/modules/gamification/infra/repository/RewardPoint.repository';
import { RewardPointType } from '@/modules/gamification/domain/RewardPoint.entity';
import { PointsTransactionType } from '@/modules/gamification/domain/PointsHistory.entity';
import { PostType } from '@/modules/post/domain/Post.entity';

@Injectable()
export class PostCreatedListener {
  private readonly logger = new Logger(PostCreatedListener.name);

  constructor(
    @Inject(IUserPointsService)
    private readonly userPointsService: IUserPointsService,
    private readonly rewardPointRepository: RewardPointRepository,
  ) {}

  @OnEvent(POST_CREATED_EVENT)
  async handleEvent(event: PostCreatedEvent) {
    this.logger.debug(
      `📨 Received POST_CREATED_EVENT - PostId: ${event.postId}, AuthorId: ${event.authorId}, Type: ${event.postType}`,
    );

    try {
      // Determine reward type based on post type
      let rewardType: RewardPointType;

      if (event.postType === PostType.BLOG) {
        rewardType = RewardPointType.CREATE_BLOG;
      } else if (event.postType === PostType.REVIEW) {
        rewardType = RewardPointType.CREATE_REVIEW;
      } else {
        this.logger.warn(`❌ Unknown post type: ${event.postType}`);
        return;
      }

      this.logger.debug(`🔍 Looking for reward point type: ${rewardType}`);

      const rewardPoint = await this.rewardPointRepository.repo.findOne({
        where: { type: rewardType },
      });

      if (!rewardPoint) {
        this.logger.warn(
          `⚠️ No reward point found for type: ${rewardType}. Please create it via POST /reward-point`,
        );
        return;
      }

      this.logger.debug(
        `💰 Found reward point: ${rewardPoint.points} points for ${rewardType}`,
      );

      // Determine transaction type
      const transactionType =
        event.postType === PostType.BLOG
          ? PointsTransactionType.CREATE_BLOG
          : PointsTransactionType.CREATE_REVIEW;

      // Add points to user
      await this.userPointsService.addPoints(
        event.authorId,
        rewardPoint.points,
        transactionType,
        `Created ${event.postType}`,
        event.postId,
      );

      this.logger.log(
        `✅ Awarded ${rewardPoint.points} points to user ${event.authorId} for ${rewardType}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Error handling post created event: ${error.message}`,
        error.stack,
      );
    }
  }
}
