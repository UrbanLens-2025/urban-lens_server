import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsEnum } from 'class-validator';
import { WalletExternalTransactionStatus } from '@/common/constants/WalletExternalTransactionStatus.constant';

export class UpdateExternalTransactionStatusDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  @IsUUID()
  transactionId: string;

  @ApiProperty({ enum: WalletExternalTransactionStatus, example: WalletExternalTransactionStatus.APPROVED })
  @IsNotEmpty()
  @IsEnum(WalletExternalTransactionStatus)
  status: WalletExternalTransactionStatus;

  // Transient field - populated from JWT token
  updatedById?: string;
}

