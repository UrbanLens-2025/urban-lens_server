import { LocationAvailabilityStatus } from '@/common/constants/LocationAvailabilityStatus.constant';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, MaxLength } from 'class-validator';

export class UpdateLocationAvailabilityStatusDto {
  // transient fields
  locationAvailabilityId: number;
  createdById: string;

  @IsOptional()
  @IsEnum(LocationAvailabilityStatus)
  @ApiPropertyOptional({ enum: LocationAvailabilityStatus })
  status?: LocationAvailabilityStatus;

  @IsOptional()
  @MaxLength(555)
  @ApiPropertyOptional()
  note?: string;
}
