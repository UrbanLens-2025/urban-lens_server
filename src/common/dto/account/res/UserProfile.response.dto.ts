import { Exclude, Expose } from 'class-transformer';
import { RankName } from '@/modules/gamification/domain/Rank.entity';

@Exclude()
export class UserProfileResponseDto {
  @Expose()
  accountId: string;

  @Expose()
  rank: RankName;

  @Expose()
  points: number;

  @Expose()
  rankingPoint: number;

  @Expose()
  totalAchievements: number;

  @Expose()
  totalCheckIns: number;

  @Expose()
  totalBlogs: number;

  @Expose()
  totalReviews: number;

  @Expose()
  totalFollowers: number;

  @Expose()
  totalFollowing: number;

  @Expose()
  dob: Date;

  @Expose()
  bio?: string | null;
}
