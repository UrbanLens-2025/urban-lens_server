import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SocialLink } from '@/common/json/SocialLink.json';
import { IsBefore } from '@/common/decorators/IsBefore.decorator';
import { IsAfterToday } from '@/common/decorators/IsAfterToday.decorator';
import { EventValidationDocumentsJson } from '@/common/json/EventValidationDocuments.json';
import dayjs from 'dayjs';

// class EventDateRange {
//   @ApiProperty({ example: new Date().toISOString() })
//   @Type(() => Date)
//   @IsNotEmpty()
//   @IsBefore('endDateTime')
//   @IsAfterToday()
//   @IsDate()
//   startDateTime: Date;

//   @ApiProperty({ example: dayjs().add(12, 'hours').toISOString() })
//   @Type(() => Date)
//   @IsNotEmpty()
//   @IsDate()
//   endDateTime: Date;
// }

// class EventLocationDto {
//   @ApiProperty({
//     description: 'ID of the business location to book for the event',
//   })
//   @IsNotEmpty()
//   @IsUUID()
//   locationId: string;

//   @ApiProperty({
//     description: 'List of date ranges for the booking',
//     isArray: true,
//     type: EventDateRange,
//   })
//   @IsArray()
//   @ArrayNotEmpty()
//   @ValidateNested({ each: true })
//   @Type(() => EventDateRange)
//   dates: EventDateRange[];
// }

export class CreateEventDto {
  // transient fields
  accountId: string;

  // api body
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(255)
  displayName: string;

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(1024)
  description: string;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  expectedNumberOfParticipants: number;

  @ApiProperty()
  @IsBoolean()
  allowTickets: boolean;

  @ApiProperty({
    isArray: true,
    type: Number,
    example: [65, 66, 67],
    description: 'Array of category IDs (EVENT type categories)',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  categoryIds: number[];

  @ApiProperty({
    type: [SocialLink],
  })
  @ValidateNested({ each: true })
  @IsOptional()
  @IsArray()
  @Type(() => SocialLink)
  social: SocialLink[];

  @ApiProperty({
    isArray: true,
    type: EventValidationDocumentsJson,
  })
  @ValidateNested({ each: true })
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => EventValidationDocumentsJson)
  eventValidationDocuments: EventValidationDocumentsJson[];

  // @ApiPropertyOptional({
  //   type: EventLocationDto,
  // })
  // @IsOptional()
  // @ValidateNested()
  // @Type(() => EventLocationDto)
  // eventLocation?: EventLocationDto | null;
}
