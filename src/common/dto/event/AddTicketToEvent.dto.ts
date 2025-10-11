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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddTicketToEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty()
  displayName: string;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  @ApiPropertyOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @ApiProperty()
  price: number;

  @IsString()
  @Length(3, 3)
  @ApiProperty()
  currency: string;

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
  @ApiProperty()
  totalQuantityAvailable: number;
}
