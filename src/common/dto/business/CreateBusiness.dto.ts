import { BusinessCategory } from '@/common/constants/Business.constant';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
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
  @ApiProperty({
    description: 'The address of the business',
    example: '123 Main St',
  })
  @IsNotEmpty()
  address: string;

  @IsString()
  @ApiProperty({ description: 'The city of the business', example: 'New York' })
  @IsNotEmpty()
  city: string;

  @IsString()
  @ApiProperty({
    description: 'The state of the business',
    example: 'New York',
  })
  @IsNotEmpty()
  state: string;

  @IsString()
  @ApiProperty({
    description: 'The zip code of the business',
    example: '10001',
  })
  @IsNotEmpty()
  zipCode: string;

  @IsString()
  @ApiProperty({
    description: 'The country of the business',
    example: 'United States',
  })
  @IsNotEmpty()
  country: string;

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

  @IsNumber()
  @ApiProperty({
    description: 'The latitude of the business',
    example: 40.7128,
  })
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @ApiProperty({
    description: 'The longitude of the business',
    example: -74.006,
  })
  @IsNotEmpty()
  longitude: number;

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
  @ApiProperty({
    description: 'The account id of the business',
    example: '1234567890',
  })
  accountId: string;

  @IsEnum(BusinessCategory)
  @ApiProperty({
    description: 'The category of the business',
    example: BusinessCategory.FOOD,
  })
  @IsNotEmpty()
  category: BusinessCategory;
}
