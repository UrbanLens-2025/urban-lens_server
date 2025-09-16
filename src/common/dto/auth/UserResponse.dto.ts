import { Role } from '@/common/constants/Role.constant';
import { Expose } from 'class-transformer';

export namespace UserResponse {
  export class UserData {
    @Expose()
    email: string;
    @Expose()
    firstName: string;
    @Expose()
    lastName: string;
    @Expose()
    phoneNumber: string;
    @Expose()
    role: Role;
  }

  export class Dto {
    @Expose()
    token: string;

    @Expose()
    user: UserData;
  }
}
