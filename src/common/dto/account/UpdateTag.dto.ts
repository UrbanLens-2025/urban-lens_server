import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsHexColor,
  IsOptional,
  IsString,
} from 'class-validator';
import { TagGroup } from '@/common/constants/TagGroup.constant';

export class UpdateTagDto {
  tagId: number;

  @ApiPropertyOptional({ example: TagGroup.USER_TYPE, enum: TagGroup })
  @IsOptional()
  @IsEnum(TagGroup)
  groupName?: TagGroup;

  @ApiPropertyOptional({ example: 'Food' })
  @IsOptional()
  displayName?: string;

  @ApiPropertyOptional({ example: '#FF5733' })
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional({ example: '🍔' })
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isSelectable?: boolean;
}
