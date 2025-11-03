import { DayOfWeek } from '@/common/constants/DayOfWeek.constant';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMilitaryTime, IsNotEmpty, IsUUID } from 'class-validator';
import { TimeIsBefore } from '@/common/decorators/TimeIsBefore.decorator';

export class CreateLocationOpeningHoursDto {
  // transient fields
  createdById: string;

  // body fields
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty()
  locationId: string;

  @ApiProperty({ enum: DayOfWeek, example: DayOfWeek.MONDAY })
  @IsEnum(DayOfWeek)
  @IsNotEmpty()
  dayOfWeek: DayOfWeek;

  @IsMilitaryTime()
  @IsNotEmpty()
  @TimeIsBefore('endTime')
  @ApiProperty()
  startTime: string;

  @IsMilitaryTime()
  @IsNotEmpty()
  @ApiProperty()
  endTime: string;
}
