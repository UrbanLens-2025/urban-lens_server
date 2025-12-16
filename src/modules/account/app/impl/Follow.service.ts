import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IFollowService } from '../IFollow.service';
import { FollowRepository } from '@/modules/account/infra/repository/Follow.repository';
import { FollowDto } from '@/common/dto/account/Follow.dto';
import { UnfollowDto } from '@/common/dto/account/Unfollow.dto';
import { GetFollowersQueryDto } from '@/common/dto/account/GetFollowersQuery.dto';
import { PaginationResult } from '@/common/services/base.service';
import { FollowEntityType } from '@/modules/account/domain/Follow.entity';
import { DataSource, In } from 'typeorm';
import { DataSource, In } from 'typeorm';
import { AccountEntity } from '@/modules/account/domain/Account.entity';
import { LocationEntity } from '@/modules/business/domain/Location.entity';
import { UserProfileEntity } from '@/modules/account/domain/UserProfile.entity';

@Injectable()
export class FollowService implements IFollowService {
  constructor(
    private readonly followRepository: FollowRepository,
    private readonly dataSource: DataSource,
  ) {}

  async follow(followerId: string, dto: FollowDto): Promise<any> {
    await this.validateEntityExists(dto.entityId, dto.entityType);

    if (
      dto.entityType === FollowEntityType.USER &&
      followerId === dto.entityId
    ) {
      throw new BadRequestException('Cannot follow yourself');
    }

    const existingFollow = await this.followRepository.repo.findOne({
      where: {
        followerId,
        entityId: dto.entityId,
        entityType: dto.entityType,
      },
    });

    if (existingFollow) {
      throw new BadRequestException('Already following this entity');
    }

    await this.dataSource.transaction(async (manager) => {
      const followRepo = manager.getRepository(
        this.followRepository.repo.target,
      );
      const follow = followRepo.create({
        followerId,
        entityId: dto.entityId,
        entityType: dto.entityType,
      });

      await followRepo.save(follow);

      // Update counters only if following a user
      if (dto.entityType === FollowEntityType.USER) {
        const userProfileRepo = manager.getRepository(UserProfileEntity);

        // Increment follower's totalFollowing
        await userProfileRepo.increment(
          { accountId: followerId },
          'totalFollowing',
          1,
        );

        // Increment followed user's totalFollowers
        await userProfileRepo.increment(
          { accountId: dto.entityId },
          'totalFollowers',
          1,
        );
      }
    });

    return { message: 'Followed successfully' };
  }

  private async validateEntityExists(
    entityId: string,
    entityType: FollowEntityType,
  ): Promise<void> {
    if (entityType === FollowEntityType.USER) {
      const accountRepo = this.dataSource.getRepository(AccountEntity);
      const user = await accountRepo.findOne({ where: { id: entityId } });

      if (!user) {
        throw new NotFoundException('User not found');
      }
    } else if (entityType === FollowEntityType.LOCATION) {
      const locationRepo = this.dataSource.getRepository(LocationEntity);
      const location = await locationRepo.findOne({
        where: { id: entityId },
      });

      if (!location) {
        throw new NotFoundException('Location not found');
      }
    }
  }

  async unfollow(followerId: string, dto: UnfollowDto): Promise<any> {
    await this.validateEntityExists(dto.entityId, dto.entityType);

    const follow = await this.followRepository.repo.findOne({
      where: {
        followerId,
        entityId: dto.entityId,
        entityType: dto.entityType,
      },
    });

    if (!follow) {
      throw new NotFoundException('Follow relationship not found');
    }

    await this.dataSource.transaction(async (manager) => {
      const followRepo = manager.getRepository(
        this.followRepository.repo.target,
      );
      await followRepo.remove(follow);

      // Update counters only if unfollowing a user
      if (dto.entityType === FollowEntityType.USER) {
        const userProfileRepo = manager.getRepository(UserProfileEntity);

        // Decrement follower's totalFollowing
        await userProfileRepo.decrement(
          { accountId: followerId },
          'totalFollowing',
          1,
        );

        // Decrement unfollowed user's totalFollowers
        await userProfileRepo.decrement(
          { accountId: dto.entityId },
          'totalFollowers',
          1,
        );
      }
    });

    return { message: 'Unfollowed successfully' };
  }

  async getFollowers(
    entityId: string,
    query: GetFollowersQueryDto,
  ): Promise<PaginationResult<any>> {
    const page = Math.max(query.page ?? 1, 1);
    const limit = Math.min(Math.max(query.limit ?? 10, 1), 100);
    const skip = (page - 1) * limit;

    const queryBuilder = this.followRepository.repo
      .createQueryBuilder('follow')
      .where('follow.entity_id = :entityId', { entityId })
      .andWhere('follow.entity_type = :entityType', {
        entityType: FollowEntityType.USER,
      .where('follow.entity_id = :entityId', { entityId })
      .andWhere('follow.entity_type = :entityType', {
        entityType: FollowEntityType.USER,
      });

    queryBuilder.addOrderBy('follow.createdAt', 'DESC');

    const [follows, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // Get follower IDs
    const followerIds = follows.map((follow) => follow.followerId);

    // Fetch users
    const users =
      followerIds.length > 0
        ? await this.dataSource.getRepository(AccountEntity).findBy({
            id: In(followerIds),
          })
        : [];

    const usersMap = new Map(users.map((u) => [u.id, u]));

    // Get follower IDs
    const followerIds = follows.map((follow) => follow.followerId);

    // Fetch users
    const users =
      followerIds.length > 0
        ? await this.dataSource.getRepository(AccountEntity).findBy({
            id: In(followerIds),
          })
        : [];

    const usersMap = new Map(users.map((u) => [u.id, u]));

    return {
      data: follows
        .map((follow) => {
          const user = usersMap.get(follow.followerId);
          if (!user) return null;
          return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            avatarUrl: user.avatarUrl,
          };
        })
        .filter((user) => user !== null),
      data: follows
        .map((follow) => {
          const user = usersMap.get(follow.followerId);
          if (!user) return null;
          return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            avatarUrl: user.avatarUrl,
          };
        })
        .filter((user) => user !== null),
      meta: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  async getFollowing(
    followerId: string,
    query: GetFollowersQueryDto,
  ): Promise<PaginationResult<any>> {
    const page = Math.max(query.page ?? 1, 1);
    const limit = Math.min(Math.max(query.limit ?? 10, 1), 100);
    const skip = (page - 1) * limit;

    const queryBuilder = this.followRepository.repo
      .createQueryBuilder('follow')
      .where('follow.follower_id = :followerId', { followerId })
      .andWhere('follow.entity_type = :entityType', {
        entityType: FollowEntityType.USER,
      .where('follow.follower_id = :followerId', { followerId })
      .andWhere('follow.entity_type = :entityType', {
        entityType: FollowEntityType.USER,
      });

    queryBuilder.addOrderBy('follow.createdAt', 'DESC');

    const [follows, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // Get user IDs
    const userIds = follows.map((follow) => follow.entityId);

    // Fetch users
    const users =
      userIds.length > 0
        ? await this.dataSource.getRepository(AccountEntity).findBy({
            id: In(userIds),
          })
        : [];

    const usersMap = new Map(users.map((u) => [u.id, u]));

    // Get user IDs
    const userIds = follows.map((follow) => follow.entityId);

    // Fetch users
    const users =
      userIds.length > 0
        ? await this.dataSource.getRepository(AccountEntity).findBy({
            id: In(userIds),
          })
        : [];

    const usersMap = new Map(users.map((u) => [u.id, u]));

    return {
      data: follows
        .map((follow) => {
          const user = usersMap.get(follow.entityId);
          if (!user) return null;
          return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            avatarUrl: user.avatarUrl,
          };
        })
        .filter((user) => user !== null),
      data: follows
        .map((follow) => {
          const user = usersMap.get(follow.entityId);
          if (!user) return null;
          return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            avatarUrl: user.avatarUrl,
          };
        })
        .filter((user) => user !== null),
      meta: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  async isFollowing(
    followerId: string,
    entityId: string,
    entityType: string,
  ): Promise<boolean> {
    const follow = await this.followRepository.repo.findOne({
      where: {
        followerId,
        entityId,
        entityType: entityType as FollowEntityType,
      },
    });

    return !!follow;
  }
}
