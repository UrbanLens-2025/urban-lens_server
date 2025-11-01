import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class SocialLinkDto {
  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty()
  platform: string;

  @IsNotEmpty()
  @IsUrl()
  @ApiProperty()
  url: string;

  @IsNotEmpty()
  @ApiProperty()
  isMain: boolean;
}

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
    type: [SocialLinkDto],
  })
  @ValidateNested({ each: true })
  @IsOptional()
  @IsArray()
  @Type(() => SocialLinkDto)
  social: SocialLinkDto[];
}
