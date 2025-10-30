import { Exclude, Expose } from 'class-transformer';
import { LocationMissionMetric } from '@/modules/gamification/domain/LocationMission.entity';

@Exclude()
export class QRCodeScanResponseDto {
  @Expose()
  success: boolean;

  @Expose()
  message: string;

  @Expose()
  missionId: string;

  @Expose()
  missionTitle: string;

  @Expose()
  missionDescription: string;

  @Expose()
  missionMetric: LocationMissionMetric;

  @Expose()
  missionTarget: number;

  @Expose()
  missionReward: number;

  @Expose()
  currentProgress: number;

  @Expose()
  isCompleted: boolean;

  @Expose()
  pointsEarned: number;

  @Expose()
  totalPoints: number;

  @Expose()
  nextRank?: string;

  @Expose()
  allMissions?: Array<{
    missionId: string;
    missionTitle: string;
    missionDescription: string;
    missionMetric: LocationMissionMetric;
    missionTarget: number;
    missionReward: number;
    currentProgress: number;
    isCompleted: boolean;
    pointsEarned: number;
  }>;
}
