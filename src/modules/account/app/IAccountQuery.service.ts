import { UserAccountResponseDto } from '@/common/dto/auth/res/UserAccountResponse.dto';
import { UserGetAccountInfoDto } from '@/common/dto/auth/UserGetAccountInfo.dto';
import { LeaderboardResponseDto } from '@/common/dto/account/res/Leaderboard.response.dto';
import { Paginated, PaginateQuery } from 'nestjs-paginate';
import { BusinessResponseDto } from '@/common/dto/account/res/Business.response.dto';

export const IAccountQueryService = Symbol('IAccountQueryService');
export interface IAccountQueryService {
  getAccountInfo(dto: UserGetAccountInfoDto): Promise<UserAccountResponseDto>;
  getLeaderboard(currentUserId?: string): Promise<LeaderboardResponseDto>;
  searchBusinesses(
    query: PaginateQuery,
  ): Promise<Paginated<BusinessResponseDto>>;
}
