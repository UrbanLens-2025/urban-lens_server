import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  POST_REACTED_EVENT,
  PostReactedEvent,
} from '@/modules/gamification/domain/events/PostReacted.event';
import { IUserPointsService } from '../IUserPoints.service';
import { RewardPointRepository } from '@/modules/gamification/infra/repository/RewardPoint.repository';
import { RewardPointType } from '@/modules/gamification/domain/RewardPoint.entity';

@Injectable()
export class PostReactedListener {
  private readonly logger = new Logger(PostReactedListener.name);

  constructor(
    @Inject(IUserPointsService)
    private readonly userPointsService: IUserPointsService,
    private readonly rewardPointRepository: RewardPointRepository,
  ) {}

  @OnEvent(POST_REACTED_EVENT)
  async handleEvent(event: PostReactedEvent) {
    try {
      // Get reward points for upvote/downvote
      const rewardPoint = await this.rewardPointRepository.repo.findOne({
        where: { type: RewardPointType.UPVOTE_DOWNVOTE },
      });

      if (!rewardPoint) {
        this.logger.warn(
          `No reward point found for type: ${RewardPointType.UPVOTE_DOWNVOTE}`,
        );
        return;
      }

      // Add points to user
      await this.userPointsService.addPoints(event.userId, rewardPoint.points);

      this.logger.log(
        `Awarded ${rewardPoint.points} points to user ${event.userId} for ${event.reactType}`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling post reacted event: ${error.message}`,
        error.stack,
      );
    }
  }
}
