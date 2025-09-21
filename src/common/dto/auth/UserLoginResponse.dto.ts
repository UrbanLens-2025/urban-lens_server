import { Expose } from 'class-transformer';
import { UserAccountResponse } from '@/common/dto/auth/UserAccountResponse.dto';

export namespace UserLoginResponse {
  export class Dto {
    @Expose()
    token: string;

    @Expose()
    user: UserAccountResponse.Dto;
  }
}
