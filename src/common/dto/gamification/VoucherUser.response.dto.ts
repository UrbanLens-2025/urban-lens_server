import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';
import { Exclude, Expose, Transform, Type } from 'class-transformer';

@Exclude()
export class VoucherUserResponseDto {
  @Expose()
  id: string;

  @Expose()
  voucherId: string;

  @Expose()
  userProfileId: string;

  @Expose()
  pointSpent: number;

  @Expose()
  userVoucherCode: string;

  @Expose()
  @Type(() => Date)
  usedAt: Date | null;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @Type(() => AccountResponseDto)
  user?: AccountResponseDto;
}

