import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsBefore } from '@/common/decorators/IsBefore.decorator';
import { CoreActionDto } from '@/common/dto/CoreAction.dto';
import { IsAfterToday } from '@/common/decorators/IsAfterToday.decorator';

class BookingDateRangeDto {
  @Type(() => Date)
  @IsNotEmpty()
  @IsBefore('endDateTime')
  @IsAfterToday()
  @ApiProperty()
  startDateTime: Date;

  @Type(() => Date)
  @IsNotEmpty()
  @IsAfterToday()
  @ApiProperty()
  endDateTime: Date;
}

export class CreateBookingForBusinessLocationDto extends CoreActionDto {
  // transient fields
  accountId: string;
  targetId?: string | null;

  // body
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  locationId: string;

  @ApiProperty({ isArray: true, type: BookingDateRangeDto })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => BookingDateRangeDto)
  dates: BookingDateRangeDto[];
}
