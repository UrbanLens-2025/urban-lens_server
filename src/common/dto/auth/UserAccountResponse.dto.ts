import { Expose } from 'class-transformer';
import { Role } from '@/common/constants/Role.constant';

export namespace UserAccountResponse {
  export class Dto {
    @Expose()
    id: string;
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
    @Expose()
    avatarUrl: string | null;
    @Expose()
    coverUrl: string | null;
    @Expose()
    hasOnboarded: boolean;
  }
}
