import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsIn } from 'class-validator';

export class GetMyVouchersQueryDto {
  @ApiPropertyOptional({
    description:
      'Filter by voucher status: expired (hết hạn), used (đã sử dụng), available (có thể sử dụng)',
    enum: ['expired', 'used', 'available'],
    example: 'available',
  })
  @IsOptional()
  @IsIn(['expired', 'used', 'available'], {
    message: 'status must be one of: expired, used, available',
  })
  status?: 'expired' | 'used' | 'available';
}
