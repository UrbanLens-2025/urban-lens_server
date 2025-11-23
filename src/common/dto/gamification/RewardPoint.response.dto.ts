import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class RewardPointResponseDto {
  @Expose()
  id: string;

  @Expose()
  type: string;

  @Expose()
  points: number;
}
