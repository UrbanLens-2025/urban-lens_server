import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';
import { UserGetAccountInfoDto } from '@/common/dto/auth/UserGetAccountInfo.dto';
import { LeaderboardResponseDto } from '@/common/dto/account/res/Leaderboard.response.dto';
import { PaginateConfig, Paginated, PaginateQuery } from 'nestjs-paginate';
import { BusinessResponseDto } from '@/common/dto/account/res/Business.response.dto';
import { BusinessEntity } from '@/modules/account/domain/Business.entity';
import { AccountEntity } from '@/modules/account/domain/Account.entity';
import { GetAccountByIdDto } from '@/common/dto/account/GetAccountById.dto';
import { GetLeaderboardSnapshotDto } from '@/common/dto/account/GetLeaderboardSnapshot.dto';
import { LeaderboardPeriodType } from '@/modules/gamification/domain/LeaderboardSnapshot.entity';

export const IAccountQueryService = Symbol('IAccountQueryService');
export interface IAccountQueryService {
  getAccountInfo(dto: UserGetAccountInfoDto): Promise<AccountResponseDto>;
  getLeaderboard(currentUserId?: string): Promise<LeaderboardResponseDto>;
  getLeaderboardSnapshot(
    dto: GetLeaderboardSnapshotDto,
    currentUserId?: string,
  ): Promise<LeaderboardResponseDto>;
  searchBusinesses(
    query: PaginateQuery,
  ): Promise<Paginated<BusinessResponseDto>>;
  getAllAccounts(query: PaginateQuery): Promise<Paginated<AccountResponseDto>>;
  getAccountById(dto: GetAccountByIdDto): Promise<AccountResponseDto>;
}

export namespace IAccountQueryService_QueryConfig {
  export function searchBusinesses(): PaginateConfig<BusinessEntity> {
    return {
      sortableColumns: ['createdAt', 'name'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: ['name'],
      filterableColumns: {
        status: true,
      },
      relations: {
        account: true,
      },
    };
  }

  export function getAllAccounts(): PaginateConfig<AccountEntity> {
    return {
      sortableColumns: ['createdAt', 'email', 'firstName', 'lastName'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: ['email', 'firstName', 'lastName', 'phoneNumber'],
      filterableColumns: {
        role: true,
        hasOnboarded: true,
        isLocked: true,
      },
    };
  }
}
