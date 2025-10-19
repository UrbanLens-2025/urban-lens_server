import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
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

export class UpdateLocationRequestDto {
  // transient fields
  accountId: string;
  locationRequestId: string;

  // persistent fields
  @ApiPropertyOptional()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @MaxLength(1024)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @MaxLength(255)
  addressLine?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @MaxLength(255)
  addressLevel1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @MaxLength(255)
  addressLevel2?: string;

  @ApiPropertyOptional({
    isArray: true,
    type: String,
    example: ['http://google.com'],
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  @IsNotEmpty({ each: true })
  locationImageUrls?: string[];

  @ApiPropertyOptional({
    isArray: true,
    type: LocationValidationDocumentsDto,
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => LocationValidationDocumentsDto)
  locationValidationDocuments?: LocationValidationDocumentsDto[];
}
