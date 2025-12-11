import {
  IsBoolean,
  IsDate,
  IsDecimal,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBefore } from '@/common/decorators/IsBefore.decorator';

export class AddTicketToEventDto {
  // transient fields
  eventId: string;
  accountId: string;

  // persistent fields
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

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({ default: true })
  isActive?: boolean;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  tos?: string;

  @IsInt()
  @Min(0)
  @ApiProperty()
  totalQuantityAvailable: number;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  @IsBefore('saleEndDate')
  @ApiProperty({ type: String, example: new Date().toISOString() })
  saleStartDate: Date;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  @ApiProperty({ type: String, example: new Date().toISOString() })
  saleEndDate: Date;

  @IsInt()
  @Min(1)
  @IsOptional()
  @ApiPropertyOptional({ default: 1 })
  minQuantityPerOrder?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  @ApiPropertyOptional({ default: 5 })
  maxQuantityPerOrder?: number;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({ default: false })
  allowRefunds?: boolean;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(1)
  @IsOptional()
  @ApiPropertyOptional()
  refundPercentageBeforeCutoff?: number;

  @IsInt()
  @IsOptional()
  @ApiPropertyOptional({ default: 4 })
  refundCutoffHoursAfterPayment?: number;
}
