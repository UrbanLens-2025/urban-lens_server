import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  CHECK_IN_CREATED_EVENT,
  CheckInCreatedEvent,
} from '@/modules/gamification/domain/events/CheckInCreated.event';
import { IUserPointsService } from '../IUserPoints.service';
import { RewardPointRepository } from '@/modules/gamification/infra/repository/RewardPoint.repository';
import { RewardPointType } from '@/modules/gamification/domain/RewardPoint.entity';
import { PointsTransactionType } from '@/modules/gamification/domain/PointsHistory.entity';

@Injectable()
export class CheckInCreatedListener {
  private readonly logger = new Logger(CheckInCreatedListener.name);

  constructor(
    @Inject(IUserPointsService)
    private readonly userPointsService: IUserPointsService,
    private readonly rewardPointRepository: RewardPointRepository,
  ) {}

  @OnEvent(CHECK_IN_CREATED_EVENT)
  async handleEvent(event: CheckInCreatedEvent) {
    try {
      // Get reward points for check-in
      const rewardPoint = await this.rewardPointRepository.repo.findOne({
        where: { type: RewardPointType.CHECK_IN },
      });

      if (!rewardPoint) {
        this.logger.warn(
          `No reward point found for type: ${RewardPointType.CHECK_IN}`,
        );
        return;
      }

      // Add points to user
      await this.userPointsService.addPoints(
        event.userId,
        rewardPoint.points,
        PointsTransactionType.CHECK_IN,
        `Check-in at location ${event.locationId}`,
        event.checkInId,
      );

      this.logger.log(
        `Awarded ${rewardPoint.points} points to user ${event.userId} for check-in at location ${event.locationId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling check-in created event: ${error.message}`,
        error.stack,
      );
    }
  }
}
