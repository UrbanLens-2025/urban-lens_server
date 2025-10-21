import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class LeaderboardUserDto {
  @Expose()
  userId: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  avatarUrl: string | null;

  @Expose()
  rankingPoint: number;

  @Expose()
  rank: number; // Position in leaderboard (1, 2, 3, ...)
}

@Exclude()
export class LeaderboardResponseDto {
  @Expose()
  rankings: LeaderboardUserDto[];

  @Expose()
  myRank: LeaderboardUserDto | null;
}
