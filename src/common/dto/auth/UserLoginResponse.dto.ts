import { Expose } from 'class-transformer';
import { UserAccountResponse } from '@/common/dto/auth/UserAccountResponse.dto';

export class UserLoginResponseDto {
  @Expose()
  token: string;

  @Expose()
  user: UserAccountResponse.Dto;
}
