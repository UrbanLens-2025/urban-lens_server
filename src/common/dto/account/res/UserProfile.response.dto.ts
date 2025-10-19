import { Exclude, Expose, Type } from 'class-transformer';
import { RankResponseDto } from '@/common/dto/gamification/res/Rank.response.dto';

@Exclude()
export class UserProfileResponseDto {
  @Expose()
  accountId: string;

  @Expose()
  @Type(() => RankResponseDto)
  rank: RankResponseDto;

  @Expose()
  points: number;

  @Expose()
  totalAchievements: number;

  @Expose()
  dob: Date;
}
