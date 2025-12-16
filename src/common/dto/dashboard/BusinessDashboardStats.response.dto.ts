import { ApiProperty } from '@nestjs/swagger';

export class BusinessDashboardStatsByDayDto {
  @ApiProperty({
    example: 'Mon',
    description: 'Day of week (Mon=Monday, Tue=Tuesday, ..., Sun=Sunday)',
  })
  day: string;

  @ApiProperty({
    example: 2,
    description: 'Number of locations owned by business',
  })
  locations: number;

  @ApiProperty({
    example: 1,
    description: 'Number of bookings for business locations',
  })
  bookings: number;

  @ApiProperty({
    example: 3,
    description: 'Number of check-ins at business locations',
  })
  checkIns: number;

  @ApiProperty({
    example: 0,
    description: 'Number of reviews for business locations',
  })
  reviews: number;
}

export class BusinessDashboardStatsByMonthDto {
  @ApiProperty({
    example: 'Jan',
    description: 'Month (Jan=January, Feb=February, ..., Dec=December)',
  })
  month: string;

  @ApiProperty({
    example: 2,
    description: 'Number of locations owned by business',
  })
  locations: number;

  @ApiProperty({
    example: 15,
    description: 'Number of bookings for business locations',
  })
  bookings: number;

  @ApiProperty({
    example: 45,
    description: 'Number of check-ins at business locations',
  })
  checkIns: number;

  @ApiProperty({
    example: 12,
    description: 'Number of reviews for business locations',
  })
  reviews: number;
}

export class BusinessDashboardStatsByYearDto {
  @ApiProperty({ example: '2024' })
  year: string;

  @ApiProperty({
    example: 5,
    description: 'Number of locations owned by business',
  })
  locations: number;

  @ApiProperty({
    example: 150,
    description: 'Number of bookings for business locations',
  })
  bookings: number;

  @ApiProperty({
    example: 450,
    description: 'Number of check-ins at business locations',
  })
  checkIns: number;

  @ApiProperty({
    example: 120,
    description: 'Number of reviews for business locations',
  })
  reviews: number;
}

