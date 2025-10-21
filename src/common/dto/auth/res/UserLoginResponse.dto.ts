import { Expose } from 'class-transformer';
import { UserAccountResponseDto } from '@/common/dto/auth/res/UserAccountResponse.dto';

export class UserLoginResponseDto {
  @Expose()
  token: string;

  @Expose()
  user: UserAccountResponseDto;
}
