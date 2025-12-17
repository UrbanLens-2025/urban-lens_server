import { ApiProperty } from '@nestjs/swagger';

export class EventCreatorDashboardStatsResponseDto {
  @ApiProperty({
    example: 10,
    description: 'Total number of events created by the event creator',
  })
  totalEvents: number;

  @ApiProperty({
    example: 5,
    description: 'Number of active events (PUBLISHED status)',
  })
  activeEvents: number;

  @ApiProperty({
    example: 3,
    description:
      'Number of upcoming events (PUBLISHED status with start_date in the future)',
  })
  upcomingEvents: number;

  @ApiProperty({
    example: 2,
    description: 'Number of draft events (DRAFT status)',
  })
  draftEvents: number;

  @ApiProperty({
    example: 100.0,
    description:
      'Percentage change in total events compared to previous period',
  })
  totalEventsPercentageChange: number;

  @ApiProperty({
    example: 5000000,
    description: 'Total revenue from all paid ticket orders (in VND)',
  })
  totalRevenue: number;

  @ApiProperty({
    example: 1500000,
    description: 'Revenue from paid ticket orders in current month (in VND)',
  })
  thisMonthRevenue: number;
}
