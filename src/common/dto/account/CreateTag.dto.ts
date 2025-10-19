import {
  IsArray,
  IsHexColor,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class CreateTagItemDto {
  @ApiProperty({ example: 'Category' })
  @IsNotEmpty()
  groupName: string;

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
}

export class CreateTagDto {
  @ApiProperty({ isArray: true, type: CreateTagItemDto })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTagItemDto)
  list: CreateTagItemDto[];
}
