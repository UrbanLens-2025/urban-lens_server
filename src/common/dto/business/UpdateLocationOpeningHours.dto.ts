import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsMilitaryTime, IsOptional } from 'class-validator';
import { TimeIsBefore } from '@/common/decorators/TimeIsBefore.decorator';

export class UpdateLocationOpeningHoursDto {
  // transient fields
  openingHoursId: number;
  createdById: string;

  // body fields
  @IsOptional()
  @IsMilitaryTime()
  @TimeIsBefore('endTime')
  @ApiPropertyOptional()
  startTime?: string;

  @IsOptional()
  @IsMilitaryTime()
  @ApiPropertyOptional()
  endTime?: string;
}
