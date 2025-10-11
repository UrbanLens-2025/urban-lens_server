import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateEventTicketDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @IsOptional()
  @ApiPropertyOptional()
  displayName?: string;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  @ApiPropertyOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @ApiPropertyOptional()
  price?: number;

  @IsString()
  @Length(3, 3)
  @IsOptional()
  @ApiPropertyOptional()
  currency?: string;

  @IsUrl()
  @IsOptional()
  @ApiPropertyOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  tos?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  @ApiPropertyOptional()
  totalQuantityAvailable?: number;
}
