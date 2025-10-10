import { ApiProperty } from '@nestjs/swagger';
import { CreatorTypes } from '@/common/constants/CreatorType.constant';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
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

export class OnboardCreatorDto {
  @ApiProperty()
  @MaxLength(555)
  @IsOptional()
  displayName?: string;

  @ApiProperty()
  @MaxLength(2000)
  @IsOptional()
  description?: string;

  @ApiProperty()
  @MaxLength(255)
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty()
  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty()
  @IsUrl()
  @IsOptional()
  avatarUrl?: string;

  @ApiProperty()
  @IsUrl()
  @IsOptional()
  coverUrl?: string;

  @ApiProperty({ enum: CreatorTypes, enumName: 'CreatorTypes' })
  @IsOptional()
  @IsEnum(CreatorTypes)
  type: CreatorTypes;

  @ApiProperty({
    type: [SocialLinkDto],
  })
  @ValidateNested({ each: true })
  @IsOptional()
  @IsArray()
  @Type(() => SocialLinkDto)
  social: SocialLinkDto[];
}
