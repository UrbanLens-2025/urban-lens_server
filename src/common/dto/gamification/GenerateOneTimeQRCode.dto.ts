import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, Max, IsString } from 'class-validator';

export class GenerateOneTimeQRCodeDto {
  @ApiProperty({
    description: 'Expiration time in minutes',
    example: 30,
    minimum: 1,
    maximum: 1440,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1440)
  expirationMinutes?: number = 30;

  @ApiProperty({
    description: 'Reference ID for the transaction/order',
    example: 'order-123',
    required: false,
  })
  @IsOptional()
  @IsString()
  referenceId?: string;
}
