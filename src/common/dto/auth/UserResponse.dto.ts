import { Role } from '@/common/constants/Role.constant';
import { Expose } from 'class-transformer';

export class UserResponseDto {
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
  token: string;
}
