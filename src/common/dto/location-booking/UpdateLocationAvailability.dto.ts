import { LocationAvailabilityStatus } from '@/common/constants/LocationAvailabilityStatus.constant';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBefore } from '@/common/decorators/IsBefore.decorator';
import { IsDate, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateLocationAvailabilityDto {
  // transient fields
  locationAvailabilityId: number;
  createdById: string;

  // body fields
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  @IsBefore('endDateTime')
  @ApiPropertyOptional()
  startDateTime: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  @ApiPropertyOptional()
  endDateTime: Date;

  @IsOptional()
  @IsEnum(LocationAvailabilityStatus)
  @ApiPropertyOptional({ enum: LocationAvailabilityStatus })
  status: LocationAvailabilityStatus;

  @MaxLength(555)
  @ApiPropertyOptional({ example: '' })
  note?: string | null;
}
