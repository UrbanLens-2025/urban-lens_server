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
import { DataSource } from 'typeorm';
import { AccountEntity } from '@/modules/auth/domain/Account.entity';
import { LocationEntity } from '@/modules/business/domain/Location.entity';

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

    const follow = this.followRepository.repo.create({
      followerId,
      entityId: dto.entityId,
      entityType: dto.entityType,
    });

    await this.followRepository.repo.save(follow);

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

    await this.followRepository.repo.remove(follow);

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
      .leftJoinAndSelect('follow.follower', 'follower')
      .where('follow.entity_id = :entityId', { entityId });

    if (query.entityType) {
      queryBuilder.andWhere('follow.entity_type = :entityType', {
        entityType: query.entityType,
      });
    }

    const [follows, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('follow.created_at', 'DESC')
      .getManyAndCount();

    return {
      data: follows.map((follow) => ({
        followId: follow.followId,
        follower: {
          id: follow.follower.id,
          firstName: follow.follower.firstName,
          lastName: follow.follower.lastName,
          avatarUrl: follow.follower.avatarUrl,
        },
        createdAt: follow.createdAt,
      })),
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
      .where('follow.follower_id = :followerId', { followerId });

    if (query.entityType) {
      queryBuilder.andWhere('follow.entity_type = :entityType', {
        entityType: query.entityType,
      });
    }

    const [follows, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('follow.created_at', 'DESC')
      .getManyAndCount();

    return {
      data: follows.map((follow) => ({
        followId: follow.followId,
        entityId: follow.entityId,
        entityType: follow.entityType,
        createdAt: follow.createdAt,
      })),
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
