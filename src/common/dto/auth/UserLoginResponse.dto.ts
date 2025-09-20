import { Expose } from 'class-transformer';
import { UserResponse } from '@/common/dto/auth/UserResponse.dto';

export namespace UserLoginResponse {
  export class Dto {
    @Expose()
    token: string;

    @Expose()
    user: UserResponse.Dto;
  }
}
