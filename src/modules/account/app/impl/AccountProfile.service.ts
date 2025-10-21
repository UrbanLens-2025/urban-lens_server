import { Injectable, NotFoundException } from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import { IAccountProfileService } from '@/modules/account/app/IAccountProfile.service';
import { GetCreatorProfileDto } from '@/common/dto/account/GetCreatorProfile.dto';
import { CreatorProfileResponseDto } from '@/common/dto/account/res/CreatorProfile.response.dto';
import { UserProfileResponseDto } from '@/common/dto/account/res/UserProfile.response.dto';
import {
  LeaderboardResponseDto,
  LeaderboardUserDto,
} from '@/common/dto/account/res/Leaderboard.response.dto';
import { CreatorProfileRepository } from '@/modules/account/infra/repository/CreatorProfile.repository';
import { UserProfileRepository } from '@/modules/account/infra/repository/UserProfile.repository';
import { UpdateResult } from 'typeorm';
import { UpdateCreatorProfileDto } from '@/common/dto/account/UpdateCreatorProfile.dto';

@Injectable()
export class AccountProfileService
  extends CoreService
  implements IAccountProfileService
{
  constructor(private readonly userProfileRepository: UserProfileRepository) {
    super();
  }

  getCreatorProfile(
    dto: GetCreatorProfileDto,
  ): Promise<CreatorProfileResponseDto> {
    const creatorProfileRepository = CreatorProfileRepository(this.dataSource);
    return creatorProfileRepository
      .findOne({
        where: {
          accountId: dto.accountId,
        },
      })
      .then((res) => this.mapTo(CreatorProfileResponseDto, res));
  }

  async getUserProfile(userId: string): Promise<UserProfileResponseDto> {
    const userProfile = await this.userProfileRepository.repo.findOne({
      where: { accountId: userId },
    });

    if (!userProfile) {
      throw new NotFoundException('User profile not found');
    }

    return this.mapTo(UserProfileResponseDto, userProfile);
  }

  updateCreatorProfile(dto: UpdateCreatorProfileDto): Promise<UpdateResult> {
    return this.ensureTransaction(null, async (manager) => {
      const creatorProfileRepository = CreatorProfileRepository(manager);
      await creatorProfileRepository.findOneByOrFail({
        accountId: dto.accountId,
      });

      return await creatorProfileRepository.update(
        { accountId: dto.accountId },
        { ...dto },
      );
    });
  }

  async getLeaderboard(
    currentUserId?: string,
  ): Promise<LeaderboardResponseDto> {
    // Get all user profiles sorted by ranking_point (highest first)
    const userProfiles = await this.userProfileRepository.repo
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
