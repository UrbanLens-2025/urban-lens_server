import { LocationAvailabilityStatus } from '@/common/constants/LocationAvailabilityStatus.constant';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBefore } from '@/common/decorators/IsBefore.decorator';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddLocationAvailabilityDto {
  // transient fields
  createdById: string;

  // body fields
  @IsNotEmpty()
  @ApiProperty()
  locationId: string;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  @IsBefore('endDateTime')
  @ApiProperty()
  startDateTime: Date;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  @ApiProperty()
  endDateTime: Date;

  @IsNotEmpty()
  @IsEnum(LocationAvailabilityStatus)
  @ApiProperty({ enum: LocationAvailabilityStatus })
  status: LocationAvailabilityStatus;

  @IsOptional()
  @MaxLength(555)
  @ApiPropertyOptional()
  note?: string;
}
