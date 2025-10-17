import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { AcceptedLocationValidationDocuments } from '@/common/constants/AcceptedLocationValidationDocuments.constant';
import { Type } from 'class-transformer';

class LocationValidationDocumentsDto {
  @ApiProperty({
    enum: AcceptedLocationValidationDocuments,
    example:
      AcceptedLocationValidationDocuments.LOCATION_REGISTRATION_CERTIFICATE,
  })
  @IsNotEmpty()
  @IsEnum(AcceptedLocationValidationDocuments)
  documentType: AcceptedLocationValidationDocuments;

  @ApiProperty({ type: String, isArray: true, example: ['http://google.com'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsNotEmpty({ each: true })
  @IsUrl({}, { each: true })
  documentImageUrls: string[];
}

export class CreateLocationRequestDto {
  // transient fields
  createdById: string;

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
  latitude: number;

  @ApiProperty()
  @IsNotEmpty()
  longitude: number;

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
  locationImageUrls: string[];

  @ApiProperty({
    type: [LocationValidationDocumentsDto],
  })
  @ValidateNested({ each: true })
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => LocationValidationDocumentsDto)
  locationValidationDocuments: LocationValidationDocumentsDto;
}
