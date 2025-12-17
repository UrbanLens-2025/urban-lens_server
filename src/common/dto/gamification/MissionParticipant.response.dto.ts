import { Exclude, Expose, Type } from 'class-transformer';
import { UserProfileResponseDto } from '@/common/dto/account/res/UserProfile.response.dto';

@Exclude()
export class MissionParticipantResponseDto {
  @Expose()
  id: string;

  @Expose()
  userProfileId: string;

  @Expose()
  missionId: string;

  @Expose()
  progress: number;

  @Expose()
  completed: boolean;

  @Expose()
  @Type(() => UserProfileResponseDto)
  userProfile?: UserProfileResponseDto;
}
