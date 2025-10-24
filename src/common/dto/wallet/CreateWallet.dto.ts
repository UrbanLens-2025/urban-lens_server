import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateWalletDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  @IsUUID()
  accountId: string;

  @ApiProperty({ example: 'USD' })
  @IsNotEmpty()
  @IsString()
  currency: string;

  // Transient field - populated from JWT token
  createdById: string;
}
