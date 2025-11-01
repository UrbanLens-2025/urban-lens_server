import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, Max, IsString } from 'class-validator';

export class GenerateOneTimeQRCodeDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1440)
  expirationMinutes?: number = 3;

  @ApiProperty({
    description: 'Mission ID to generate QR code for (optional)',
    example: 'mission-uuid-123',
    required: false,
  })
  @IsOptional()
  @IsString()
  missionId?: string;
}
