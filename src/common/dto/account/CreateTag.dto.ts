import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsHexColor,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TagGroup } from '@/common/constants/TagGroup.constant';

class CreateTagItemDto {
  @ApiProperty({ example: TagGroup.USER_TYPE })
  @IsEnum(TagGroup)
  @IsNotEmpty()
  groupName: TagGroup;

  @ApiProperty({ example: 'Food' })
  @IsNotEmpty()
  displayName: string;

  @ApiProperty({ example: '#FF5733' })
  @IsNotEmpty()
  @IsHexColor()
  color: string;

  @ApiProperty({ example: '🍔' })
  @IsNotEmpty()
  icon: string;

  @ApiProperty()
  @IsBoolean()
  isSelectable: boolean;
}

export class CreateTagDto {
  @ApiProperty({ isArray: true, type: CreateTagItemDto })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTagItemDto)
  list: CreateTagItemDto[];
}
