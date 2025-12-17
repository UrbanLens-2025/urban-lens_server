import { Injectable, Inject } from '@nestjs/common';
import { IMissionProgressService } from '../IMissionProgress.service';
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

  /**
   * Update mission progress for check-in
   * Now only tracks check-ins, no other metrics
   */
  async updateMissionProgress(
    userId: string,
    locationId: string,
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

      // Tìm các mission active cho location này
      const now = new Date();
      const missions = await this.locationMissionRepository.repo
        .createQueryBuilder('mission')
        .where('mission.locationId = :locationId', { locationId })
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

        // Cập nhật progress (mỗi check-in = +1)
        const newProgress = Math.min(userProgress.progress + 1, mission.target);
        const isCompleted = newProgress >= mission.target;

        userProgress.progress = newProgress;
        userProgress.completed = isCompleted;
        if (isCompleted) {
          userProgress.completedAt = new Date();
        }
        await this.userMissionProgressRepository.repo.save(userProgress);

        // Nếu hoàn thành, award points
        if (isCompleted) {
          await this.userPointsService.addPoints(
            userId,
            mission.reward,
            PointsTransactionType.LOCATION_MISSION,
            `Completed mission: ${mission.title}`,
            mission.id,
          );
        }
      }
    } catch (error) {
      console.error('Error updating mission progress:', error);
    }
  }
}
