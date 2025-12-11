import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsIn } from 'class-validator';

export class GetAnalyticsQueryDto {
  @ApiPropertyOptional({
    description:
      'Filter type: day (last 7 days), month (12 months in current year), or year (all years)',
    enum: ['day', 'month', 'year'],
    example: 'day',
  })
  @IsOptional()
  @IsIn(['day', 'month', 'year'], {
    message: 'filter must be one of: day, month, year',
  })
  filter?: 'day' | 'month' | 'year';
}
