import { ApiProperty } from '@nestjs/swagger';

export class VoucherStatisticsResponseDto {
  @ApiProperty({
    description: 'Total number of vouchers initially created',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Number of vouchers that have been used',
    example: 45,
  })
  used: number;

  @ApiProperty({
    description: 'Number of vouchers remaining (not yet used)',
    example: 55,
  })
  remaining: number;
}
