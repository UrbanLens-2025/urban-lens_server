import { ApiProperty } from '@nestjs/swagger';

export class TopLocationByCheckInsDto {
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
    description: 'Number of check-ins in current month',
    example: 45,
  })
  checkInsCount: number;
}

