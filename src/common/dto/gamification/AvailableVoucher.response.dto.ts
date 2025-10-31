import { ApiProperty } from '@nestjs/swagger';
import { LocationVoucherType } from '@/modules/gamification/domain/LocationVoucher.entity';

export class AvailableVoucherResponseDto {
  @ApiProperty({
    description: 'Voucher ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Voucher title',
    example: 'Giảm giá 20%',
  })
  title: string;

  @ApiProperty({
    description: 'Voucher description',
    example: 'Giảm giá 20% cho đơn hàng',
  })
  description: string;

  @ApiProperty({
    description: 'Voucher code',
    example: 'SUMMER2024',
  })
  voucherCode: string;

  @ApiProperty({
    description: 'Points required to exchange this voucher',
    example: 100,
  })
  pointsRequired: number;

  @ApiProperty({
    description: 'Maximum quantity available',
    example: 50,
  })
  maxQuantity: number;

  @ApiProperty({
    description: 'Maximum times a user can redeem this voucher',
    example: 2,
  })
  userRedeemedLimit: number;

  @ApiProperty({
    description: 'Voucher image URL',
    example: 'https://example.com/voucher-image.jpg',
    nullable: true,
  })
  imageUrl: string | null;

  @ApiProperty({
    description: 'Voucher type',
    enum: LocationVoucherType,
    example: LocationVoucherType.PUBLIC,
  })
  voucherType: LocationVoucherType;

  @ApiProperty({
    description: 'Voucher start date',
    example: '2024-01-01T00:00:00Z',
  })
  startDate: Date;

  @ApiProperty({
    description: 'Voucher end date',
    example: '2024-12-31T23:59:59Z',
  })
  endDate: Date;

  @ApiProperty({
    description: 'Voucher creation date',
    example: '2024-01-01T00:00:00Z',
  })
  createdAt: Date;
}
