import { Expose } from 'class-transformer';
import { Role } from '@/common/constants/Role.constant';

export class AccountResponseDto {
  @Expose()
  id: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  avatarUrl: string | null;

  @Expose()
  coverUrl: string | null;

  @Expose()
  role: Role;
}
