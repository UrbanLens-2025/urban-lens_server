import { ApiProperty } from '@nestjs/swagger';

export class LocationBookingsStatsResponseDto {
  @ApiProperty({
    description: 'Total number of location bookings',
    example: 7,
  })
  totalBookings: number;

  @ApiProperty({
    description: 'Number of approved bookings',
    example: 5,
  })
  approved: number;

  @ApiProperty({
    description: 'Number of pending bookings (awaiting business action)',
    example: 1,
  })
  pending: number;

  @ApiProperty({
    description: 'Total revenue from approved bookings',
    example: 8931500,
  })
  totalRevenue: number;
}
