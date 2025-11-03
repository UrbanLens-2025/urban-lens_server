import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
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
import { Type } from 'class-transformer';
import { IsBefore } from '@/common/decorators/IsBefore.decorator';

export class UpdateEventTicketDto {
  // transient fields
  ticketId: string;
  accountId: string;

  // persistent fields
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

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  tos?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  @ApiPropertyOptional()
  totalQuantityAvailable?: number;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  @IsBefore('saleEndDate')
  @ApiPropertyOptional({ type: String, example: new Date().toISOString() })
  saleStartDate?: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  @ApiPropertyOptional({ type: String, example: new Date().toISOString() })
  saleEndDate?: Date;

  @IsInt()
  @Min(1)
  @IsOptional()
  @ApiPropertyOptional()
  minQuantityPerOrder?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  @ApiPropertyOptional()
  maxQuantityPerOrder?: number;
}
