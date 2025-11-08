import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsUrl,
} from 'class-validator';
import { AcceptedBusinessLicenseTypes } from '@/common/constants/AcceptedBusinessLicenseTypes.constant';

export class BusinessLicenseJson {
  @ApiProperty({
    enum: AcceptedBusinessLicenseTypes,
    example: AcceptedBusinessLicenseTypes.BUSINESS_LICENSE,
  })
  @IsNotEmpty()
  @IsEnum(AcceptedBusinessLicenseTypes)
  licenseType: AcceptedBusinessLicenseTypes;

  @ApiProperty({
    type: String,
    isArray: true,
    example: ['http://google.com'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsNotEmpty({ each: true })
  @IsUrl({}, { each: true })
  documentImageUrls: string[];
}

