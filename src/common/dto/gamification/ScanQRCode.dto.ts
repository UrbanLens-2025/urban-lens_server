import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsString as IsStringArray,
} from 'class-validator';

export class ScanQRCodeDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'QR code data scanned by user',
    example: 'mission:uuid-123:location:uuid-456',
  })
  qrCodeData: string;

  @IsOptional()
  @IsArray()
  @IsStringArray({ each: true })
  @ApiProperty({
    description: 'Images uploaded as proof of completion',
    type: [String],
    required: false,
    example: [
      'https://example.com/proof1.jpg',
      'https://example.com/proof2.jpg',
    ],
  })
  proofImages?: string[];

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Additional notes or comments',
    example: 'Completed the mission successfully!',
    required: false,
  })
  notes?: string;

  @IsOptional()
  @ApiProperty({
    description: 'Reference ID for the order (order ID, receipt number, etc.)',
    example: 'order-uuid-123',
    required: false,
  })
  referenceId?: string;
}
