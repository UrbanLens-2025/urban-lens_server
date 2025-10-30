import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { LocationVoucherType } from '@/modules/gamification/domain/LocationVoucher.entity';

export class CreateLocationVoucherDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Voucher title',
    example: '20% off your next purchase',
  })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Voucher description',
    example: 'Get 20% discount on your next purchase at our location',
  })
  description: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Voucher image URL',
    example: 'https://example.com/voucher.jpg',
    required: false,
  })
  imageUrl?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @ApiProperty({
    description: 'Points required to redeem this voucher',
    example: 500,
  })
  pricePoint: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @ApiProperty({
    description: 'Maximum quantity available for this voucher',
    example: 100,
  })
  maxQuantity: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @ApiProperty({
    description: 'Maximum times a user can redeem this voucher',
    example: 3,
  })
  userRedeemedLimit: number;

  @IsOptional()
  @IsEnum(LocationVoucherType)
  @ApiProperty({
    description: 'Voucher type - public or mission only',
    enum: LocationVoucherType,
    example: LocationVoucherType.PUBLIC,
    required: false,
  })
  voucherType?: LocationVoucherType;

  @IsNotEmpty()
  @IsDateString()
  @ApiProperty({
    description: 'Voucher start date',
    example: '2024-01-01T00:00:00Z',
  })
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  @ApiProperty({
    description: 'Voucher end date',
    example: '2024-12-31T23:59:59Z',
  })
  endDate: string;
}
