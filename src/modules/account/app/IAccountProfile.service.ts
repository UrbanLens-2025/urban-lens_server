import { GetCreatorProfileDto } from '@/common/dto/account/GetCreatorProfile.dto';
import { CreatorProfileResponseDto } from '@/common/dto/account/res/CreatorProfile.response.dto';
import { UserProfileResponseDto } from '@/common/dto/account/res/UserProfile.response.dto';
import { LeaderboardResponseDto } from '@/common/dto/account/res/Leaderboard.response.dto';
import { UpdateResult } from 'typeorm';
import { UpdateCreatorProfileDto } from '@/common/dto/account/UpdateCreatorProfile.dto';

export const IAccountProfileService = Symbol('IProfileService');
export interface IAccountProfileService {
  getCreatorProfile(
    dto: GetCreatorProfileDto,
  ): Promise<CreatorProfileResponseDto>;

  getUserProfile(userId: string): Promise<UserProfileResponseDto>;

  updateCreatorProfile(dto: UpdateCreatorProfileDto): Promise<UpdateResult>;

  getLeaderboard(currentUserId?: string): Promise<LeaderboardResponseDto>;
}
