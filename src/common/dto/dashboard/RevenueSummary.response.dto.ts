import { ApiProperty } from '@nestjs/swagger';

export class RevenueSummaryResponseDto {
  @ApiProperty({
    description: 'Total revenue that has been paid out (achieved revenue)',
    example: 1000000,
  })
  totalRevenue: number;

  @ApiProperty({
    description: 'Available balance that can be withdrawn',
    example: 500000,
  })
  available: number;

  @ApiProperty({
    description:
      'Revenue pending for system payout (revenue that will be received)',
    example: 200000,
  })
  pending: number;

  @ApiProperty({
    description: 'Amount pending for admin approval (withdraw requests)',
    example: 100000,
  })
  pendingWithdraw: number;

  @ApiProperty({
    description: 'Total balance (deposit + revenue)',
    example: 1500000,
  })
  totalBalance: number;
}
