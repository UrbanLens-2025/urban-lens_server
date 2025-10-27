import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { CreateLocationVoucherDto } from './CreateLocationVoucher.dto';

export class UpdateLocationVoucherDto extends PartialType(
  CreateLocationVoucherDto,
) {
  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Whether voucher is active',
    example: true,
    required: false,
  })
  isActive?: boolean;
}
