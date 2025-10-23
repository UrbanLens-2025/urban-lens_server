import { Expose } from 'class-transformer';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';

export class UserLoginResponseDto {
  @Expose()
  token: string;

  @Expose()
  user: AccountResponseDto;
}
