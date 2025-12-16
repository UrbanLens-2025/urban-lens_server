import { ApiProperty } from '@nestjs/swagger';

export class EventsLocationsDataByDayDto {
  @ApiProperty({
    example: 'Mon',
    description: 'Day of week (Mon=Monday, Tue=Tuesday, ..., Sun=Sunday)',
  })
  day: string;

  @ApiProperty({
    example: 15,
    description: 'Number of events created on this day',
  })
  events: number;

  @ApiProperty({
    example: 32,
    description: 'Number of locations created on this day',
  })
  locations: number;
}

export class EventsLocationsDataByMonthDto {
  @ApiProperty({
    example: 'Jan',
    description: 'Month (Jan=January, Feb=February, ..., Dec=December)',
  })
  month: string;

  @ApiProperty({
    example: 150,
    description: 'Number of events created in this month',
  })
  events: number;

  @ApiProperty({
    example: 320,
    description: 'Number of locations created in this month',
  })
  locations: number;
}

export class EventsLocationsDataByYearDto {
  @ApiProperty({ example: '2024' })
  year: string;

  @ApiProperty({
    example: 1250,
    description: 'Number of events created in this year',
  })
  events: number;

  @ApiProperty({
    example: 3200,
    description: 'Number of locations created in this year',
  })
  locations: number;
}
