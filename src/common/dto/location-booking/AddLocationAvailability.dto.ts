import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMilitaryTime, IsNotEmpty, IsUUID } from 'class-validator';
import { TimeIsBefore } from '@/common/decorators/TimeIsBefore.decorator';
import { DayOfWeek } from '@/common/constants/DayOfWeek.constant';

export class AddLocationAvailabilityDto {
  // transient fields
  createdById: string;

  // body fields
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty()
  locationId: string;

  @IsMilitaryTime()
  @IsNotEmpty()
  @TimeIsBefore('endTime')
  @ApiProperty()
  startTime: string;

  @IsMilitaryTime()
  @IsNotEmpty()
  @ApiProperty()
  endTime: string;

  @ApiProperty({ enum: DayOfWeek, example: DayOfWeek.MONDAY })
  @IsEnum(DayOfWeek)
  @IsNotEmpty()
  dayOfWeek: DayOfWeek;
}
