import { ApiProperty } from '@nestjs/swagger';

export class EventCreatorPerformanceByDayDto {
  @ApiProperty({
    example: 'Mon',
    description: 'Day of week (Mon=Monday, Tue=Tuesday, ..., Sun=Sunday)',
  })
  day: string;

  @ApiProperty({
    example: 5,
    description: 'Number of draft events',
  })
  draft: number;

  @ApiProperty({
    example: 10,
    description: 'Number of published events',
  })
  published: number;

  @ApiProperty({
    example: 3,
    description: 'Number of finished events',
  })
  finished: number;
}

export class EventCreatorPerformanceByMonthDto {
  @ApiProperty({
    example: 'Jan',
    description: 'Month (Jan=January, Feb=February, ..., Dec=December)',
  })
  month: string;

  @ApiProperty({
    example: 5,
    description: 'Number of draft events',
  })
  draft: number;

  @ApiProperty({
    example: 10,
    description: 'Number of published events',
  })
  published: number;

  @ApiProperty({
    example: 3,
    description: 'Number of finished events',
  })
  finished: number;
}

export class EventCreatorPerformanceByYearDto {
  @ApiProperty({ example: '2024' })
  year: string;

  @ApiProperty({
    example: 5,
    description: 'Number of draft events',
  })
  draft: number;

  @ApiProperty({
    example: 10,
    description: 'Number of published events',
  })
  published: number;

  @ApiProperty({
    example: 3,
    description: 'Number of finished events',
  })
  finished: number;
}
