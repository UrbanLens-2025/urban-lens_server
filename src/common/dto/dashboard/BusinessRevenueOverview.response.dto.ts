import { ApiProperty } from '@nestjs/swagger';

export class BusinessRevenueOverviewResponseDto {
  @ApiProperty({
    description: 'Total revenue from all bookings (all time)',
    example: 5000000,
  })
  totalRevenue: number;

  @ApiProperty({
    description: 'Revenue from bookings in current month',
    example: 1500000,
  })
  thisMonthRevenue: number;
}

