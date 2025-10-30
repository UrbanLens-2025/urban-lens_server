import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class GenerateQRCodeDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @ApiProperty({
    description: 'QR code size in pixels',
    example: 256,
    required: false,
    default: 256,
  })
  size?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'QR code format',
    example: 'png',
    required: false,
    default: 'png',
  })
  format?: string;
}
