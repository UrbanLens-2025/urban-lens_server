import { FollowDto } from '@/common/dto/account/Follow.dto';
import { UnfollowDto } from '@/common/dto/account/Unfollow.dto';
import { GetFollowersQueryDto } from '@/common/dto/account/GetFollowersQuery.dto';
import { PaginationResult } from '@/common/services/base.service';

export const IFollowService = Symbol('IFollowService');

export interface IFollowService {
  follow(followerId: string, dto: FollowDto): Promise<any>;
  unfollow(followerId: string, dto: UnfollowDto): Promise<any>;
  getFollowers(
    entityId: string,
    query: GetFollowersQueryDto,
  ): Promise<PaginationResult<any>>;
  getFollowing(
    followerId: string,
    query: GetFollowersQueryDto,
  ): Promise<PaginationResult<any>>;
  isFollowing(
    followerId: string,
    entityId: string,
    entityType: string,
  ): Promise<boolean>;
}
