import { Expose } from 'class-transformer';
import { Role } from '@/common/constants/Role.constant';

export namespace UserResponse {
  export class Dto {
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
}
