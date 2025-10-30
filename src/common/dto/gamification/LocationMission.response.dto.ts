import { Exclude, Expose } from 'class-transformer';
import { LocationMissionMetric } from '@/modules/gamification/domain/LocationMission.entity';

@Exclude()
export class LocationMissionResponseDto {
  @Expose()
  id: string;

  @Expose()
  locationId: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  metric: LocationMissionMetric;

  @Expose()
  target: number;

  @Expose()
  reward: number;

  @Expose()
  startDate: Date;

  @Expose()
  endDate: Date;

  @Expose()
  imageUrls: string[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
