import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetExternalTransactionByProviderIdDto {
  @ApiProperty({ example: 'stripe' })
  @IsNotEmpty()
  @IsString()
  provider: string;

  @ApiProperty({ example: 'pi_1234567890' })
  @IsNotEmpty()
  @IsString()
  providerTransactionId: string;
}
