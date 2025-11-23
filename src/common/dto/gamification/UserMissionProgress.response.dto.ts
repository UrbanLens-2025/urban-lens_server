import { Exclude, Expose, Type } from 'class-transformer';
import { LocationMissionResponseDto } from './LocationMission.response.dto';

@Exclude()
export class UserMissionProgressResponseDto {
  @Expose()
  id: string;

  @Expose()
  userProfileId: string;

  @Expose()
  missionId: string;

  @Expose()
  @Type(() => LocationMissionResponseDto)
  mission?: LocationMissionResponseDto;

  @Expose()
  progress: number;

  @Expose()
  completed: boolean;
}
