import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { WalletExternalTransactionDirection } from '@/common/constants/WalletExternalTransactionDirection.constant';

export class CreateExternalTransactionDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  @IsUUID()
  walletId: string;

  @ApiProperty({ example: 'stripe' })
  @IsNotEmpty()
  @IsString()
  provider: string;

  @ApiProperty({ example: 'pi_1234567890' })
  @IsNotEmpty()
  @IsString()
  providerTransactionId: string;

  @ApiProperty({
    enum: WalletExternalTransactionDirection,
    example: WalletExternalTransactionDirection.DEPOSIT,
  })
  @IsNotEmpty()
  @IsEnum(WalletExternalTransactionDirection)
  direction: WalletExternalTransactionDirection;

  @ApiProperty({ example: 100.5 })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: 'USD' })
  @IsNotEmpty()
  @IsString()
  currency: string;

  @ApiPropertyOptional({ example: 'REF-123456' })
  @IsOptional()
  @IsString()
  referenceCode?: string;

  // Transient field - populated from JWT token
  createdById: string;
}
