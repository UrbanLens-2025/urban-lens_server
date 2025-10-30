import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsHexColor, IsOptional } from 'class-validator';

export class UpdateTagDto {
  tagId: number;

  @ApiPropertyOptional({ example: 'Category' })
  @IsOptional()
  groupName?: string;

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
