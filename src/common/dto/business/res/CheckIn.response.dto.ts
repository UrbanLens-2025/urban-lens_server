import { Expose, Type } from 'class-transformer';
import { UserProfileResponseDto } from '@/common/dto/account/res/UserProfile.response.dto';
import { LocationResponseDto } from '@/common/dto/business/res/Location.response.dto';

export class CheckInResponseDto {
  @Expose()
  id: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  userProfileId: string;

  @Expose()
  @Type(() => UserProfileResponseDto)
  userProfile?: UserProfileResponseDto;

  @Expose()
  locationId: string;

  @Expose()
  @Type(() => LocationResponseDto)
  location?: LocationResponseDto;

  @Expose()
  latitudeAtCheckIn: number;

  @Expose()
  longitudeAtCheckIn: number;
}
