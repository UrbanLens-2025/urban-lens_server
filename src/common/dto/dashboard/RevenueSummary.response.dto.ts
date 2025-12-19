import { ApiProperty } from '@nestjs/swagger';

export class RevenueSummaryResponseDto {
  @ApiProperty({
    description: 'Total revenue from all time',
    example: 1000000,
  })
  totalRevenue: number;

  @ApiProperty({
    description: 'Available balance that can be withdrawn',
    example: 500000,
  })
  available: number;

  @ApiProperty({
    description: 'Profit pending for system payout',
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
