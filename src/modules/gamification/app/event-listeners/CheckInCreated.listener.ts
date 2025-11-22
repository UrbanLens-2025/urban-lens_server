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
import type { IUserLocationProfileService } from '../IUserLocationProfile.service';

@Injectable()
export class CheckInCreatedListener {
  private readonly logger = new Logger(CheckInCreatedListener.name);

  constructor(
    @Inject(IUserPointsService)
    private readonly userPointsService: IUserPointsService,
    @Inject('IUserLocationProfileService')
    private readonly userLocationProfileService: IUserLocationProfileService,
    private readonly rewardPointRepository: RewardPointRepository,
  ) {}

  @OnEvent(CHECK_IN_CREATED_EVENT)
  async handleEvent(event: CheckInCreatedEvent) {
    this.logger.log(
      `📥 CheckInCreated event received: userId=${event.userId}, locationId=${event.locationId}, checkInId=${event.checkInId}`,
    );
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

      this.logger.log(
        `💰 Found reward point: ${rewardPoint.points} points for check-in`,
      );

      // Add points to user (for global ranking) - only from check-in
      await this.userPointsService.addPoints(
        event.userId,
        rewardPoint.points,
        PointsTransactionType.CHECK_IN,
        `Check-in at location ${event.locationId}`,
        event.checkInId,
      );

      // Create UserLocationProfile (for voucher redemption) - no points added
      await this.userLocationProfileService.createOrGetUserLocationProfile(
        event.userId,
        event.locationId,
      );

      this.logger.log(
        `Awarded ${rewardPoint.points} global points to user ${event.userId} for check-in at location ${event.locationId}`,
      );
      this.logger.log(
        `Created UserLocationProfile for user ${event.userId} at location ${event.locationId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling check-in created event: ${error.message}`,
        error.stack,
      );
    }
  }
}
