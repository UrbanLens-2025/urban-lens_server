import { ApiProperty } from '@nestjs/swagger';

export class RevenueDataByDayDto {
  @ApiProperty({
    example: 'T2',
    description: 'Day of week (T2=Monday, T3=Tuesday, ..., CN=Sunday)',
  })
  day: string;

  @ApiProperty({ example: 320000000 })
  deposit: number;

  @ApiProperty({ example: 180000000 })
  withdraw: number;
}

export class RevenueDataByMonthDto {
  @ApiProperty({
    example: 'T1',
    description: 'Month (T1=January, T2=February, ..., T12=December)',
  })
  month: string;

  @ApiProperty({ example: 8500000000 })
  deposit: number;

  @ApiProperty({ example: 4200000000 })
  withdraw: number;
}

export class RevenueDataByYearDto {
  @ApiProperty({ example: '2024' })
  year: string;

  @ApiProperty({ example: 45000000000 })
  deposit: number;

  @ApiProperty({ example: 22000000000 })
  withdraw: number;
}

export class UserDataByDayDto {
  @ApiProperty({
    example: 'T2',
    description: 'Day of week (T2=Monday, T3=Tuesday, ..., CN=Sunday)',
  })
  day: string;

  @ApiProperty({ example: 150 })
  count: number;
}

export class UserDataByMonthDto {
  @ApiProperty({
    example: 'T1',
    description: 'Month (T1=January, T2=February, ..., T12=December)',
  })
  month: string;

  @ApiProperty({ example: 1250 })
  count: number;
}

export class UserDataByYearDto {
  @ApiProperty({ example: '2024' })
  year: string;

  @ApiProperty({ example: 12540 })
  count: number;
}

export class AnalyticsResponseDto {
  @ApiProperty({ type: [RevenueDataByDayDto], required: false })
  revenueDataByDay?: RevenueDataByDayDto[];

  @ApiProperty({ type: [RevenueDataByMonthDto], required: false })
  revenueDataByMonth?: RevenueDataByMonthDto[];

  @ApiProperty({ type: [RevenueDataByYearDto], required: false })
  revenueDataByYear?: RevenueDataByYearDto[];
}
