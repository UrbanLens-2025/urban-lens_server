import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreatePublicLocationDto {
  // transient fields
  accountId: string;

  // persistent fields
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(1024)
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  longitude: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  radiusMeters: number;

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(255)
  addressLine: string;

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(255)
  addressLevel1: string;

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(255)
  addressLevel2: string;

  @ApiProperty({ isArray: true, type: String, example: ['http://google.com'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsUrl({}, { each: true })
  @IsNotEmpty({ each: true })
  imageUrl: string[];

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isVisibleOnMap: boolean;

  @ApiProperty({ isArray: true, type: Number, example: [1, 2, 3] })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  @IsNotEmpty({ each: true })
  tagIds: number[];
}
