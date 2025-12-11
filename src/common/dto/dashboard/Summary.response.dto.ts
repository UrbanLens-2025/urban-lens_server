import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SummaryCardDto {
  @ApiProperty({
    description: 'Title of the summary card',
    example: 'Users',
  })
  title: string;

  @ApiProperty({
    description: 'Current value',
    example: 12540,
  })
  value: number;

  @ApiPropertyOptional({
    description:
      'Percentage change compared to previous period (only when no date filter)',
    example: 12.5,
  })
  delta?: number;

  @ApiPropertyOptional({
    description: 'Trend direction (only when no date filter)',
    enum: ['up', 'down'],
    example: 'up',
  })
  trend?: 'up' | 'down';

  @ApiPropertyOptional({
    description: 'Description of the metric (only when no date filter)',
    example: 'Increased compared to 7 days ago',
  })
  description?: string;
}

export type SummaryResponseDto = SummaryCardDto[];
