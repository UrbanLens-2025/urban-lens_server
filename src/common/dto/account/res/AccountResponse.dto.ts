import { Expose, Type } from 'class-transformer';
import { Role } from '@/common/constants/Role.constant';
import { UserProfileResponseDto } from '@/common/dto/account/res/UserProfile.response.dto';
import { BusinessResponseDto } from '@/common/dto/account/res/Business.response.dto';
import { CreatorProfileResponseDto } from '@/common/dto/account/res/CreatorProfile.response.dto';

export class AccountResponseDto {
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
  isLocked: boolean;

  @Expose()
  @Type(() => UserProfileResponseDto)
  userProfile?: UserProfileResponseDto;

  @Expose()
  @Type(() => BusinessResponseDto)
  businessProfile?: BusinessResponseDto;

  @Expose()
  @Type(() => CreatorProfileResponseDto)
  creatorProfile?: CreatorProfileResponseDto;
}
