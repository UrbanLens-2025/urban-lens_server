import { Injectable } from '@nestjs/common';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';
import { AccountRepositoryProvider } from '@/modules/account/infra/repository/Account.repository';
import { CoreService } from '@/common/core/Core.service';
import { UserGetAccountInfoDto } from '@/common/dto/auth/UserGetAccountInfo.dto';
import { Role } from '@/common/constants/Role.constant';
import { In } from 'typeorm';
import {
  IAccountQueryService,
  IAccountQueryService_QueryConfig,
} from '@/modules/account/app/IAccountQuery.service';
import {
  LeaderboardResponseDto,
  LeaderboardUserDto,
} from '@/common/dto/account/res/Leaderboard.response.dto';
import { UserProfileRepositoryProvider } from '@/modules/account/infra/repository/UserProfile.repository';
import { BusinessResponseDto } from '@/common/dto/account/res/Business.response.dto';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { BusinessRepositoryProvider } from '@/modules/account/infra/repository/Business.repository';
import { GetAccountByIdDto } from '@/common/dto/account/GetAccountById.dto';
import { GetLeaderboardSnapshotDto } from '@/common/dto/account/GetLeaderboardSnapshot.dto';
import { LeaderboardPeriodHelper } from '@/modules/gamification/app/helper/LeaderboardPeriod.helper';
import { Inject } from '@nestjs/common';
import { ILeaderboardSnapshotService } from '@/modules/gamification/app/ILeaderboardSnapshot.service';
import { GetMyBusinessesDto } from '@/common/dto/account/GetMyBusinesses.dto';

@Injectable({})
export class AccountQueryService
  extends CoreService
  implements IAccountQueryService
{
  constructor(
    @Inject(ILeaderboardSnapshotService)
    private readonly leaderboardSnapshotService: ILeaderboardSnapshotService,
  ) {
    super();
  }
  async getAccountInfo(
    dto: UserGetAccountInfoDto,
  ): Promise<AccountResponseDto> {
    const accountRepository = AccountRepositoryProvider(this.dataSource);
    return await accountRepository
      .findOneOrFail({
        where: {
          id: dto.userId,
          role: In([
            Role.USER,
            Role.BUSINESS_OWNER,
            Role.EVENT_CREATOR,
            ...(dto.allowAdmin ? [Role.ADMIN] : []),
          ]),
        },
        relations: {
          userProfile: true,
          businessProfile: true,
          creatorProfile: true,
        },
      })
      .then((res) => this.mapTo(AccountResponseDto, res));
  }

  searchBusinesses(
    query: PaginateQuery,
  ): Promise<Paginated<BusinessResponseDto>> {
    return paginate(query, BusinessRepositoryProvider(this.dataSource), {
      ...IAccountQueryService_QueryConfig.searchBusinesses(),
    }).then((res) => this.mapToPaginated(BusinessResponseDto, res));
  }

  async getLeaderboard(
    currentUserId?: string,
    limit?: number,
  ): Promise<LeaderboardResponseDto> {
    const userProfileRepository = UserProfileRepositoryProvider(
      this.dataSource,
    );
    const queryBuilder = userProfileRepository
      .createQueryBuilder('userProfile')
      .leftJoin('userProfile.account', 'account')
      .select([
        'userProfile.accountId',
        'userProfile.rankingPoint',
        'account.firstName',
        'account.lastName',
        'account.avatarUrl',
      ])
      .orderBy('userProfile.ranking_point', 'DESC');

    if (limit) {
      queryBuilder.limit(limit);
    }

    const userProfiles = await queryBuilder.getMany();

    const rankings: LeaderboardUserDto[] = userProfiles.map(
      (profile, index) => ({
        userId: profile.accountId,
        firstName: profile.account?.firstName || '',
        lastName: profile.account?.lastName || '',
        avatarUrl: profile.account?.avatarUrl || null,
        rankingPoint: profile.rankingPoint,
        rank: index + 1,
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

  getAllAccounts(query: PaginateQuery): Promise<Paginated<AccountResponseDto>> {
    return paginate(query, AccountRepositoryProvider(this.dataSource), {
      ...IAccountQueryService_QueryConfig.getAllAccounts(),
    }).then((res) => this.mapToPaginated(AccountResponseDto, res));
  }

  async getAccountById(dto: GetAccountByIdDto): Promise<AccountResponseDto> {
    const accountRepository = AccountRepositoryProvider(this.dataSource);
    return await accountRepository
      .findOneOrFail({
        where: {
          id: dto.accountId,
        },
        relations: {
          userProfile: true,
          businessProfile: true,
          creatorProfile: true,
        },
      })
      .then((res) => this.mapTo(AccountResponseDto, res));
  }

  async getLeaderboardSnapshot(
    dto: GetLeaderboardSnapshotDto,
    currentUserId?: string,
  ): Promise<LeaderboardResponseDto> {
    const periodValue =
      dto.periodValue || LeaderboardPeriodHelper.getPeriodValue(dto.periodType);
    const currentPeriodValue =
      LeaderboardPeriodHelper.getPeriodValue(dto.periodType);

    // Try to get snapshot data
    let rankings = await this.leaderboardSnapshotService.getLeaderboardSnapshot(
      dto.periodType,
      periodValue,
      dto.limit || 100,
    );

    // If no snapshot found and querying current period, fallback to real-time leaderboard
    if (rankings.length === 0 && periodValue === currentPeriodValue) {
      // Use real-time leaderboard for current period with limit
      const realTimeLeaderboard = await this.getLeaderboard(
        currentUserId,
        dto.limit || 100,
      );
      return realTimeLeaderboard;
    }

    // Find current user's rank if userId is provided
    let myRank: LeaderboardUserDto | null = null;
    if (currentUserId) {
      const userRank = rankings.find((r) => r.userId === currentUserId);
      if (userRank) {
        myRank = userRank;
      }
    }

    return {
      rankings,
      myRank,
    };
  }

  async getMyBusinesses(
    dto: GetMyBusinessesDto,
  ): Promise<BusinessResponseDto[]> {
    const businessRepository = BusinessRepositoryProvider(this.dataSource);
    const businesses = await businessRepository.find({
      where: {
        accountId: dto.accountId,
      },
    });
    return this.mapToArray(BusinessResponseDto, businesses);
  }
}
