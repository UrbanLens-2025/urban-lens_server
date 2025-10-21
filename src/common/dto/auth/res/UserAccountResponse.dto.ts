import { Expose, Type } from 'class-transformer';
import { Role } from '@/common/constants/Role.constant';
import { UserProfileResponseDto } from '@/common/dto/account/res/UserProfile.response.dto';

export class UserAccountResponseDto {
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
  @Expose()
  @Type(() => UserProfileResponseDto)
  userProfile?: UserProfileResponseDto;
}
