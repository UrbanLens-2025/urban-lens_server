import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateRankDto {
  @ApiPropertyOptional({ example: 0, description: 'Minimum points required' })
  @IsOptional()
  @IsInt()
  @Min(0)
  minPoints?: number;

  @ApiPropertyOptional({
    example: 999,
    description: 'Maximum points for this rank',
  })
  @IsOptional()
  @IsInt()
  maxPoints?: number;

  @ApiPropertyOptional({ example: '🥉', description: 'Rank icon/emoji' })
  @IsOptional()
  @IsString()
  icon: string;
}
