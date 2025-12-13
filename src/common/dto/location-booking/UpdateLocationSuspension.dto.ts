import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';

export class UpdateLocationSuspensionDto {
  locationSuspensionId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  suspensionReason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  suspendedUntil?: Date;
}
