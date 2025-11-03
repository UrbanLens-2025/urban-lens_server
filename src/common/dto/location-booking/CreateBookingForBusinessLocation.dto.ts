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

class BookingDateRangeDto {
  @Type(() => Date)
  @IsNotEmpty()
  @IsBefore('endDateTime')
  @ApiProperty()
  startDateTime: Date;

  @Type(() => Date)
  @IsNotEmpty()
  @ApiProperty()
  endDateTime: Date;
}

export class CreateBookingForBusinessLocationDto {
  // transient fields
  accountId: string;

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
