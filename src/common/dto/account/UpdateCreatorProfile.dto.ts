import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

class SocialLinkUpdateDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(255)
  platform?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsUrl()
  url?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  isMain?: boolean;
}

export class UpdateCreatorProfileDto {
  // transient fields
  accountId: string;

  // request body
  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @MaxLength(555)
  displayName?: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @MaxLength(255)
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @IsUrl()
  coverUrl?: string;

  @ApiPropertyOptional({
    enum: CreatorTypes,
    enumName: 'CreatorTypes',
    required: false,
  })
  @IsOptional()
  @IsEnum(CreatorTypes)
  type?: CreatorTypes;

  @ApiPropertyOptional({ type: [SocialLinkUpdateDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialLinkUpdateDto)
  social?: SocialLinkUpdateDto[];
}
