import { Expose, Type } from 'class-transformer';
import { Role } from '@/common/constants/Role.constant';
import { UserProfileResponseDto } from '@/common/dto/account/res/UserProfile.response.dto';
import { BusinessResponseDto } from '@/common/dto/account/res/Business.response.dto';

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

  @Expose()
  @Type(() => UserProfileResponseDto)
  userProfile?: UserProfileResponseDto;

  @Expose()
  @Type(() => BusinessResponseDto)
  businessProfile?: BusinessResponseDto;
}
