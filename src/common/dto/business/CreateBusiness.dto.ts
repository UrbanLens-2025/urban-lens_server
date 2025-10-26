import { BusinessCategory } from '@/common/constants/Business.constant';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateBusinessDto {
  @IsString()
  @ApiProperty({
    description: 'The name of the business',
    example: 'Business Name',
  })
  @IsNotEmpty()
  name: string;

  @IsString()
  @ApiProperty({
    description: 'The description of the business',
    example: 'Business Description',
  })
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({ description: 'Địa chỉ văn phòng công ty' })
  addressLine: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({ description: 'Địa chỉ văn phòng công ty' })
  addressLevel1: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({ description: 'Địa chỉ văn phòng công ty' })
  addressLevel2: string;

  @IsString()
  @ApiProperty({
    description: 'The email of the business',
    example: 'business@example.com',
  })
  @IsNotEmpty()
  email: string;

  @IsString()
  @ApiProperty({
    description: 'The phone of the business',
    example: '1234567890',
  })
  @IsNotEmpty()
  phone: string;

  @IsString()
  @ApiProperty({
    description: 'The avatar of the business',
    example: 'https://www.business.com/avatar.png',
  })
  @IsNotEmpty()
  avatar: string;

  @IsString()
  @ApiProperty({
    description: 'The license number of the business',
    example: '1234567890',
  })
  @IsNotEmpty()
  licenseNumber: string;

  @IsString()
  @ApiProperty({
    description: 'The license expiration date of the business',
    example: '2025-01-01',
  })
  @IsNotEmpty()
  licenseExpirationDate: string;

  @IsString()
  @ApiProperty({
    description: 'The license type of the business',
    example: 'Business License',
  })
  @IsNotEmpty()
  licenseType: string;

  @IsString()
  @ApiProperty({
    description: 'The website of the business',
    example: 'https://www.business.com',
  })
  @IsNotEmpty()
  website: string;

  @IsOptional()
  @IsString()
  accountId: string;

  @IsEnum(BusinessCategory)
  @ApiProperty({
    description: 'The category of the business',
    example: BusinessCategory.FOOD,
  })
  @IsNotEmpty()
  category: BusinessCategory;
}
