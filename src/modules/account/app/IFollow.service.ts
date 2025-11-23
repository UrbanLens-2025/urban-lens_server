import { FollowDto } from '@/common/dto/account/Follow.dto';
import { UnfollowDto } from '@/common/dto/account/Unfollow.dto';
import { GetFollowersQueryDto } from '@/common/dto/account/GetFollowersQuery.dto';
import { PaginationResult } from '@/common/services/base.service';
import { FollowResponseDto } from '@/common/dto/account/Follow.response.dto';

export const IFollowService = Symbol('IFollowService');

export interface IFollowService {
  follow(followerId: string, dto: FollowDto): Promise<FollowResponseDto>;
  unfollow(followerId: string, dto: UnfollowDto): Promise<{ message: string }>;
  getFollowers(
    entityId: string,
    query: GetFollowersQueryDto,
  ): Promise<PaginationResult<FollowResponseDto>>;
  getFollowing(
    followerId: string,
    query: GetFollowersQueryDto,
  ): Promise<PaginationResult<FollowResponseDto>>;
  isFollowing(
    followerId: string,
    entityId: string,
    entityType: string,
  ): Promise<boolean>;
}
