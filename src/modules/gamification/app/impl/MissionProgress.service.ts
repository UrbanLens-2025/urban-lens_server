import { Injectable, Inject } from '@nestjs/common';
import { IMissionProgressService } from '../IMissionProgress.service';
import { LocationMissionMetric } from '../../domain/LocationMission.entity';
import { LocationMissionRepository } from '@/modules/gamification/infra/repository/LocationMission.repository';
import { UserMissionProgressRepository } from '@/modules/gamification/infra/repository/UserMissionProgress.repository';
import { IUserPointsService } from '../IUserPoints.service';
import { PointsTransactionType } from '../../domain/PointsHistory.entity';
import { ICheckInMissionService } from '../ICheckInMission.service';

@Injectable()
export class MissionProgressService implements IMissionProgressService {
  constructor(
    private readonly locationMissionRepository: LocationMissionRepository,
    private readonly userMissionProgressRepository: UserMissionProgressRepository,
    @Inject(IUserPointsService)
    private readonly userPointsService: IUserPointsService,
    @Inject(ICheckInMissionService)
    private readonly checkInMissionService: ICheckInMissionService,
  ) {}

  async updateMissionProgress(
    userId: string,
    locationId: string,
    metric: LocationMissionMetric,
    referenceId?: string,
  ): Promise<void> {
    try {
      // Kiểm tra user đã check-in tại location này chưa
      const canDoMission = await this.checkInMissionService.canUserDoMission(
        userId,
        locationId,
      );

      if (!canDoMission) {
        // User chưa check-in, không thể làm mission
        return;
      }

      // Tìm các mission active cho location này với metric tương ứng
      const now = new Date();
      const missions = await this.locationMissionRepository.repo
        .createQueryBuilder('mission')
        .where('mission.locationId = :locationId', { locationId })
        .andWhere('mission.metric = :metric', { metric })
        .andWhere('mission.startDate <= :now', { now })
        .andWhere('mission.endDate >= :now', { now })
        .getMany();

      for (const mission of missions) {
        // Lấy hoặc tạo user progress
        let userProgress =
          await this.userMissionProgressRepository.repo.findOne({
            where: {
              userProfileId: userId,
              missionId: mission.id,
            },
          });

        if (!userProgress) {
          userProgress = this.userMissionProgressRepository.repo.create({
            userProfileId: userId,
            missionId: mission.id,
            progress: 0,
            completed: false,
          });
        }

        // Kiểm tra xem đã hoàn thành chưa
        if (userProgress.completed) {
          continue;
        }

        // Cập nhật progress
        const progressIncrement = this.calculateProgressIncrement(metric);
        const newProgress = Math.min(
          userProgress.progress + progressIncrement,
          mission.target,
        );
        const isCompleted = newProgress >= mission.target;

        userProgress.progress = newProgress;
        userProgress.completed = isCompleted;
        await this.userMissionProgressRepository.repo.save(userProgress);

        // Nếu hoàn thành, award points
        if (isCompleted) {
          await this.userPointsService.addPoints(
            userId,
            mission.reward,
            this.getTransactionType(metric),
            `Completed mission: ${mission.title}`,
            mission.id,
          );
        }
      }
    } catch (error) {
      console.error('Error updating mission progress:', error);
    }
  }

  private calculateProgressIncrement(metric: LocationMissionMetric): number {
    switch (metric) {
      case LocationMissionMetric.LIKE_POSTS:
      case LocationMissionMetric.COMMENT_POSTS:
      case LocationMissionMetric.JOIN_EVENTS:
      case LocationMissionMetric.SHARE_POSTS:
      case LocationMissionMetric.FOLLOW_LOCATION:
        return 1; // Mỗi action = +1
      default:
        return 0;
    }
  }

  private getTransactionType(
    metric: LocationMissionMetric,
  ): PointsTransactionType {
    switch (metric) {
      case LocationMissionMetric.LIKE_POSTS:
        return PointsTransactionType.CREATE_COMMENT; // Sử dụng existing type
      case LocationMissionMetric.COMMENT_POSTS:
        return PointsTransactionType.CREATE_COMMENT;
      case LocationMissionMetric.JOIN_EVENTS:
        return PointsTransactionType.CHECK_IN; // Sử dụng existing type
      case LocationMissionMetric.SHARE_POSTS:
        return PointsTransactionType.CREATE_BLOG; // Sử dụng existing type
      case LocationMissionMetric.FOLLOW_LOCATION:
        return PointsTransactionType.CHECK_IN; // Sử dụng existing type
      default:
        return PointsTransactionType.ADMIN_ADJUSTMENT;
    }
  }
}
