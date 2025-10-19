import { Exclude, Expose } from 'class-transformer';
import { RankName } from '@/modules/gamification/domain/Rank.entity';

@Exclude()
export class RankResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: RankName;

  @Expose()
  minPoints: number;

  @Expose()
  maxPoints: number;

  @Expose()
  icon: string;
}
