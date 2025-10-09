import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCheckInDto {
  @ApiProperty({
    description: 'Location ID to check in',
    example: 'uuid-location-id',
  })
  @IsNotEmpty()
  @IsUUID()
  locationId: string;

  @ApiPropertyOptional({
    description: 'Optional notes for the check-in',
    example: 'Great coffee shop!',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
