import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ScanQRCodeDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'QR code data scanned by user',
    example: 'mission:uuid-123:location:uuid-456',
  })
  qrCodeData: string;
}
