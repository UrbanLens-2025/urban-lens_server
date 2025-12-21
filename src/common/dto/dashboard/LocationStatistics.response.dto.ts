import { ApiProperty } from '@nestjs/swagger';

export class LocationStatisticsResponseDto {
  @ApiProperty({
    description: 'Total number of check-ins at this location',
    example: 150,
  })
  checkIns: number;

  @ApiProperty({
    description: 'Total revenue from bookings',
    example: 5000000,
  })
  revenue: number;

  @ApiProperty({
    description: 'Total number of announcements/posts (reviews and blogs)',
    example: 25,
  })
  announcements: number;

  @ApiProperty({
    description: 'Total number of vouchers',
    example: 10,
  })
  vouchers: number;

  @ApiProperty({
    description: 'Total number of missions',
    example: 5,
  })
  missions: number;
}
