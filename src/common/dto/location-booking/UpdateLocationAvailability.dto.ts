import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsMilitaryTime, IsOptional } from 'class-validator';
import { TimeIsBefore } from '@/common/decorators/TimeIsBefore.decorator';

export class UpdateLocationAvailabilityDto {
  // transient fields
  locationAvailabilityId: number;
  createdById: string;

  // body fields
  @IsMilitaryTime()
  @IsOptional()
  @TimeIsBefore('endTime')
  @ApiPropertyOptional()
  startTime?: string;

  @IsMilitaryTime()
  @IsOptional()
  @ApiPropertyOptional()
  endTime?: string;
}
