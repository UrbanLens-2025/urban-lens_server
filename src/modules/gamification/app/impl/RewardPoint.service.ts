import { Injectable, BadRequestException, Logger } from '@nestjs/common';

import { CreateRewardPointDto } from '@/common/dto/gamification/create-reward-point.dto';
import { RewardPointEntity } from '../../domain/RewardPoint.entity';
import { RewardPointRepository } from '../../infra/repository/RewardPoint.repository';
import { IRewardPointService } from '../IRewardPoint.service';
import { UpdateRewardPointDto } from '@/common/dto/gamification/update-reward-point.dto';
import { PointsRecalculationService } from './PointsRecalculation.service';

@Injectable()
export class RewardPointService implements IRewardPointService {
  private readonly logger = new Logger(RewardPointService.name);

  constructor(
    private readonly rewardPointRepository: RewardPointRepository,
    private readonly pointsRecalculationService: PointsRecalculationService,
  ) {}

  async createRewardPoint(dto: CreateRewardPointDto): Promise<string> {
    const existingRewardPoint = await this.rewardPointRepository.repo.findOne({
      where: { type: dto.type },
    });
    if (existingRewardPoint) {
      throw new BadRequestException('Reward point already exists');
    }
    const rewardPoint = await this.rewardPointRepository.repo.save(
      this.rewardPointRepository.repo.create({
        type: dto.type,
        points: dto.points,
      }),
    );
    return rewardPoint.id;
  }

  async getRewardPoints(): Promise<any> {
    const rewardPoints = await this.rewardPointRepository.repo.find();
    return rewardPoints;
  }

  async updateRewardPoint(
    id: string,
    dto: UpdateRewardPointDto,
  ): Promise<string> {
    const rewardPoint = await this.rewardPointRepository.repo.findOne({
      where: { id },
    });
    if (!rewardPoint) {
      throw new BadRequestException('Reward point not found');
    }

    const oldPoints = rewardPoint.points;
    rewardPoint.points = dto.points;
    await this.rewardPointRepository.repo.save(rewardPoint);

    // Log the change
    this.logger.log(
      `Updated reward point ${rewardPoint.type}: ${oldPoints} → ${dto.points}`,
    );

    // Trigger recalculation for all users in background
    this.logger.log(
      'Triggering points recalculation for all users in background...',
    );
    this.pointsRecalculationService
      .recalculateAllUsersPoints()
      .then((result) => {
        this.logger.log(
          `Background recalculation completed: ${result.updated} users updated, ${result.errors} errors`,
        );
      })
      .catch((error) => {
        this.logger.error(
          `Background recalculation failed: ${error.message}`,
          error.stack,
        );
      });

    return rewardPoint.id;
  }

  async deleteRewardPoint(id: string): Promise<void> {
    await this.rewardPointRepository.repo.delete(id);
  }
}
