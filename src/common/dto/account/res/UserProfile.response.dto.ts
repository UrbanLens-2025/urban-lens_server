import { Rank } from '@/common/constants/Rank.constant';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserProfileResponseDto {
  @Expose()
  accountId: string;

  @Expose()
  rank: Rank;

  @Expose()
  points: number;

  @Expose()
  totalAchievements: number;
}
