import { Exclude, Expose, Type, Transform } from 'class-transformer';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';

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
  @Type(() => AccountResponseDto)
  user?: AccountResponseDto;
}
