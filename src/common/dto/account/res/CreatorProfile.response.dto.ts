import { Exclude, Expose, Type } from 'class-transformer';
import { CreatorTypes } from '@/common/constants/CreatorType.constant';
import { SocialLink } from '@/common/json/SocialLink.json';

@Exclude()
export class CreatorProfileResponseDto {
  @Expose()
  accountId: string;

  @Expose()
  displayName: string;

  @Expose()
  description: string;

  @Expose()
  email: string;

  @Expose()
  phoneNumber: string;

  @Expose()
  avatarUrl: string;

  @Expose()
  coverUrl: string;

  @Expose()
  type: CreatorTypes;

  @Expose()
  @Type(() => SocialLink)
  social?: SocialLink[];
}
