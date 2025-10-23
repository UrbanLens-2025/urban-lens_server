import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  COMMENT_CREATED_EVENT,
  CommentCreatedEvent,
} from '@/modules/gamification/domain/events/CommentCreated.event';
import { IUserPointsService } from '../IUserPoints.service';
import { RewardPointRepository } from '@/modules/gamification/infra/repository/RewardPoint.repository';
import { RewardPointType } from '@/modules/gamification/domain/RewardPoint.entity';
import { PointsTransactionType } from '@/modules/gamification/domain/PointsHistory.entity';

@Injectable()
export class CommentCreatedListener {
  private readonly logger = new Logger(CommentCreatedListener.name);

  constructor(
    @Inject(IUserPointsService)
    private readonly userPointsService: IUserPointsService,
    private readonly rewardPointRepository: RewardPointRepository,
  ) {}

  @OnEvent(COMMENT_CREATED_EVENT)
  async handleEvent(event: CommentCreatedEvent) {
    try {
      // Get reward points for creating comment
      const rewardPoint = await this.rewardPointRepository.repo.findOne({
        where: { type: RewardPointType.CREATE_COMMENT },
      });

      if (!rewardPoint) {
        this.logger.warn(
          `No reward point found for type: ${RewardPointType.CREATE_COMMENT}`,
        );
        return;
      }

      // Add points to user
      await this.userPointsService.addPoints(
        event.authorId,
        rewardPoint.points,
        PointsTransactionType.CREATE_COMMENT,
        `Created comment on post ${event.postId}`,
        event.commentId,
      );

      this.logger.log(
        `Awarded ${rewardPoint.points} points to user ${event.authorId} for creating comment`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling comment created event: ${error.message}`,
        error.stack,
      );
    }
  }
}
