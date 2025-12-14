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
import { IsValidPeriodValue } from '@/common/decorators/IsValidPeriodValue.decorator';

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
      'Period value format: YYYY-WW for weekly (e.g., 2025-W12), YYYY-MM for monthly (e.g., 2025-12), YYYY for yearly (e.g., 2025), YYYY-season for seasonal (e.g., 2025-spring). If not provided, uses current period.',
    example: '2025-11',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsValidPeriodValue()
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
