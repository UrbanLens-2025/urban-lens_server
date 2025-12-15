import { Exclude, Expose, Type } from 'class-transformer';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';

@Exclude()
export class AccountSuspensionResponseDto {
  @Expose()
  id: string;

  @Expose()
  accountId: string;

  @Expose()
  @Type(() => AccountResponseDto)
  account?: AccountResponseDto | null;

  @Expose()
  suspensionReason?: string | null;

  @Expose()
  suspendedUntil?: Date | null;

  @Expose()
  suspendedById?: string | null;

  @Expose()
  @Type(() => AccountResponseDto)
  suspendedBy?: AccountResponseDto | null;

  @Expose()
  isActive?: boolean | null;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  updatedAt: Date;
}

