import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { LeaderboardPeriodType } from '@/modules/gamification/domain/LeaderboardSnapshot.entity';

export class GetLeaderboardSnapshotDto {
  @ApiProperty({
    enum: LeaderboardPeriodType,
    description: 'Type of leaderboard period',
    example: LeaderboardPeriodType.MONTHLY,
  })
  @IsEnum(LeaderboardPeriodType)
  periodType: LeaderboardPeriodType;

  @ApiProperty({
    description:
      'Period value: YYYY-MM for monthly, YYYY for yearly, YYYY-season for seasonal (e.g., 2025-spring). If not provided, uses current period.',
    example: '2025-11',
    required: false,
  })
  @IsOptional()
  @IsString()
  periodValue?: string;

  @ApiProperty({
    description: 'Maximum number of results to return',
    example: 100,
    default: 100,
    required: false,
    minimum: 1,
    maximum: 500,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(500)
  limit?: number;
}
