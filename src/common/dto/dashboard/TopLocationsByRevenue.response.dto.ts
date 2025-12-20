import { ApiProperty } from '@nestjs/swagger';

export class TopLocationByRevenueDto {
  @ApiProperty({
    description: 'Location ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  locationId: string;

  @ApiProperty({
    description: 'Location name',
    example: 'Coffee Shop Downtown',
  })
  locationName: string;

  @ApiProperty({
    description: 'Total revenue from bookings',
    example: 3000000,
  })
  revenue: number;
}
