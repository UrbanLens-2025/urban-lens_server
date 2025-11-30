import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { IsAfterToday } from '@/common/decorators/IsAfterToday.decorator';
import { IsBefore } from '@/common/decorators/IsBefore.decorator';
import dayjs from 'dayjs';

class EventDateRange {
  @ApiProperty({ example: new Date().toISOString() })
  @Type(() => Date)
  @IsNotEmpty()
  @IsBefore('endDateTime')
  @IsAfterToday()
  @IsDate()
  startDateTime: Date;

  @ApiProperty({ example: dayjs().add(12, 'hours').toISOString() })
  @Type(() => Date)
  @IsNotEmpty()
  @IsDate()
  endDateTime: Date;
}

export class AddLocationBookingDto {
  eventId: string;
  accountId: string;

  @ApiProperty({
    description: 'ID of the business location to book for the event',
  })
  @IsNotEmpty()
  @IsUUID()
  locationId: string;

  @ApiProperty({
    description: 'List of date ranges for the booking',
    isArray: true,
    type: EventDateRange,
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => EventDateRange)
  dates: EventDateRange[];
}
