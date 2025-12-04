import { Exclude, Expose, Transform } from 'class-transformer';
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
  @Transform(({ value }) => {
    if (value === null || value === undefined) return 0;
    return typeof value === 'string' ? parseInt(value, 10) : Number(value);
  })
  totalCheckIns: number;

  @Expose()
  totalBlogs: number;

  @Expose()
  @Transform(({ value }) => {
    if (value === null || value === undefined) return 0;
    return typeof value === 'string' ? parseInt(value, 10) : Number(value);
  })
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
