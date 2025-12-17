import { ApiProperty } from '@nestjs/swagger';

export class BusinessRevenueByDayDto {
  @ApiProperty({
    example: 'Mon',
    description: 'Day of week (Mon=Monday, Tue=Tuesday, ..., Sun=Sunday)',
  })
  day: string;

  @ApiProperty({
    example: 500000,
    description: 'Revenue for this day (in VND)',
  })
  revenue: number;
}

export class BusinessRevenueByMonthDto {
  @ApiProperty({
    example: 'Jan',
    description: 'Month (Jan=January, Feb=February, ..., Dec=December)',
  })
  month: string;

  @ApiProperty({
    example: 1500000,
    description: 'Revenue for this month (in VND)',
  })
  revenue: number;
}

export class BusinessRevenueByYearDto {
  @ApiProperty({ example: '2024' })
  year: string;

  @ApiProperty({
    example: 5000000,
    description: 'Revenue for this year (in VND)',
  })
  revenue: number;
}
