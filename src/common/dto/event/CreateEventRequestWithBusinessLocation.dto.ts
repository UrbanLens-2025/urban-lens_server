import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDate,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
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

export class CreateEventRequestWithBusinessLocationDto {
  // transient fields
  accountId: string;

  // api body
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(255)
  eventName: string;

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(1024)
  eventDescription: string;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  expectedNumberOfParticipants: number;

  @ApiProperty()
  @IsBoolean()
  allowTickets: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(624)
  specialRequirements: string;

  @ApiProperty({ isArray: true, type: Number, example: [1, 2, 3] })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  @IsNotEmpty({ each: true })
  tagIds: number[];

  @ApiProperty({
    type: [SocialLink],
  })
  @ValidateNested({ each: true })
  @IsOptional()
  @IsArray()
  @Type(() => SocialLink)
  social: SocialLink[];

  @ApiProperty({
    description: 'ID of the business location to book for the event',
  })
  @IsNotEmpty()
  @IsUUID()
  locationId: string;

  @ApiProperty()
  @Type(() => Date)
  @IsNotEmpty()
  @IsBefore('endDateTime')
  @IsAfterToday()
  @IsDate()
  startDateTime: Date;

  @ApiProperty()
  @Type(() => Date)
  @IsNotEmpty()
  @IsDate()
  endDateTime: Date;

  @ApiProperty({
    isArray: true,
    type: EventValidationDocumentsJson,
  })
  @ValidateNested({ each: true })
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => EventValidationDocumentsJson)
  eventValidationDocuments: EventValidationDocumentsJson[];
}
