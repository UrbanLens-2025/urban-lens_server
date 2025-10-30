import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class OneTimeQRCodeResponseDto {
  @ApiProperty({
    description: 'QR code ID',
    example: 'qr-123',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'QR code data',
    example: 'https://app.urbanlens.com/scan?qr=abc123',
  })
  @Expose()
  qrCodeData: string;

  @ApiProperty({
    description: 'QR code image URL (empty - client will generate)',
    example: '',
  })
  @Expose()
  qrCodeUrl: string;

  // Removed missionId since one-time QR codes work with all ORDER_COUNT missions at a location

  @ApiProperty({
    description: 'Location ID',
    example: 'location-456',
  })
  @Expose()
  locationId: string;

  @ApiProperty({
    description: 'Expiration time',
    example: '2024-01-01T12:00:00Z',
  })
  @Expose()
  expiresAt: Date;

  @ApiProperty({
    description: 'Reference ID',
    example: 'order-789',
  })
  @Expose()
  referenceId: string | null;

  @ApiProperty({
    description: 'Is QR code used',
    example: false,
  })
  @Expose()
  isUsed: boolean;

  @ApiProperty({
    description: 'Created at',
    example: '2024-01-01T11:30:00Z',
  })
  @Expose()
  createdAt: Date;
}
