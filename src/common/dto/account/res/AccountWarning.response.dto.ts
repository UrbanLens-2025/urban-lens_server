import { Exclude, Expose, Type } from 'class-transformer';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';

@Exclude()
export class AccountWarningResponseDto {
  @Expose()
  id: string;

  @Expose()
  accountId: string;

  @Expose()
  @Type(() => AccountResponseDto)
  account?: AccountResponseDto | null;

  @Expose()
  warningNote: string;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  updatedAt: Date;
}
