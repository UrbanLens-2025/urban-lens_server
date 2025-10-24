import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

export class UpdateWalletBalanceDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Account ID (Wallet Primary Key)',
  })
  @IsNotEmpty()
  @IsUUID()
  accountId: string;

  @ApiProperty({ example: 100.5 })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  newBalance: number;

  // Transient field - populated from JWT token
  updatedById: string;
}
