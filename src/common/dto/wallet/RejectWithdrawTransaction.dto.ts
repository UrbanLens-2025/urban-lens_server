import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class RejectWithdrawTransactionDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  @IsUUID()
  transactionId: string;

  @ApiProperty({ example: 'Insufficient verification documents' })
  @IsNotEmpty()
  @IsString()
  rejectionReason: string;

  // Transient field - populated from JWT token
  rejectedById: string;
}

