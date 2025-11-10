import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class RejectWithdrawTransactionDto {
  transactionId: string;
  accountId: string;
  accountName: string;

  @ApiProperty({
    description: 'Reason for rejecting the withdraw transaction',
    example: 'Insufficient documentation provided',
  })
  @IsNotEmpty()
  @IsString()
  rejectionReason: string;
}
