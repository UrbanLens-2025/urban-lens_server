import { Injectable } from '@nestjs/common';
import { UserAccountResponseDto } from '@/common/dto/auth/res/UserAccountResponse.dto';
import { AccountRepositoryProvider } from '@/modules/account/infra/repository/Account.repository';
import { CoreService } from '@/common/core/Core.service';
import { UserGetAccountInfoDto } from '@/common/dto/auth/UserGetAccountInfo.dto';
import { Role } from '@/common/constants/Role.constant';
import { In } from 'typeorm';
import { IAccountQueryService } from '@/modules/account/app/IAccountQuery.service';
import {
  LeaderboardResponseDto,
  LeaderboardUserDto,
} from '@/common/dto/account/res/Leaderboard.response.dto';
import { UserProfileRepositoryProvider } from '@/modules/account/infra/repository/UserProfile.repository';
import { BusinessResponseDto } from '@/common/dto/account/res/Business.response.dto';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { BusinessRepositoryProvider } from '@/modules/account/infra/repository/Business.repository';

@Injectable({})
export class AccountQueryService
  extends CoreService
  implements IAccountQueryService
{
  async getAccountInfo(
    dto: UserGetAccountInfoDto,
  ): Promise<UserAccountResponseDto> {
    const accountRepository = AccountRepositoryProvider(this.dataSource);
    return await accountRepository
      .findOneOrFail({
        where: {
          id: dto.userId,
          role: In([Role.USER, Role.BUSINESS_OWNER, Role.EVENT_CREATOR]),
        },
        relations: {
          userProfile: true,
          businessProfile: true,
        },
      })
      .then((res) => this.mapTo(UserAccountResponseDto, res));
  }

  searchBusinesses(
    query: PaginateQuery,
  ): Promise<Paginated<BusinessResponseDto>> {
    return paginate(query, BusinessRepositoryProvider(this.dataSource), {
      sortableColumns: ['createdAt', 'name'],
      defaultSortBy: [['createdAt', 'DESC']],
      relations: {
        account: true,
      },
    }).then((res) => this.mapToPaginated(BusinessResponseDto, res));
  }

  async getLeaderboard(
    currentUserId?: string,
  ): Promise<LeaderboardResponseDto> {
    const userProfileRepository = UserProfileRepositoryProvider(
      this.dataSource,
    );
    // Get all user profiles sorted by ranking_point (highest first)
    const userProfiles = await userProfileRepository
      .createQueryBuilder('userProfile')
      .leftJoin('userProfile.account', 'account')
      .select([
        'userProfile.accountId',
        'userProfile.rankingPoint',
        'account.firstName',
        'account.lastName',
        'account.avatarUrl',
      ])
      .orderBy('userProfile.ranking_point', 'DESC')
      .getMany();

    // Map to leaderboard users with rank position
    const rankings: LeaderboardUserDto[] = userProfiles.map(
      (profile, index) => ({
        userId: profile.accountId,
        firstName: profile.account?.firstName || '',
        lastName: profile.account?.lastName || '',
        avatarUrl: profile.account?.avatarUrl || null,
        rankingPoint: profile.rankingPoint,
        rank: index + 1, // Position in leaderboard (1-based)
      }),
    );

    // Find current user's rank if userId is provided
    let myRank: LeaderboardUserDto | null = null;
    if (currentUserId) {
      const userRankIndex = rankings.findIndex(
        (r) => r.userId === currentUserId,
      );
      if (userRankIndex !== -1) {
        myRank = rankings[userRankIndex];
      }
    }

    return {
      rankings,
      myRank,
    };
  }
}
