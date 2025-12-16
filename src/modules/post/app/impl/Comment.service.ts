import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ICommentService } from '../IComment.service';
import { CreateCommentRequestDto } from '@/common/dto/post/CreateComment.dto';
import { CommentRepository } from '../../infra/repository/Comment.repository';
import { BaseService, PaginationParams } from '@/common/services/base.service';
import { CommentEntity } from '../../domain/Comment.entity';
import { PostRepository } from '../../infra/repository/Post.repository';
import { ReactRepository } from '../../infra/repository/React.repository';
import { ReactCommentRequestDto } from '@/common/dto/post/ReactComment.dto';
import { ReactEntityType, ReactType } from '../../domain/React.entity';
import { DeleteCommentRequestDto } from '@/common/dto/post/DeleteComment.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  COMMENT_CREATED_EVENT,
  CommentCreatedEvent,
} from '@/modules/gamification/domain/events/CommentCreated.event';
import { PostEntity, PostType } from '../../domain/Post.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LocationEntity } from '@/modules/business/domain/Location.entity';
import { BusinessEntity } from '@/modules/account/domain/Business.entity';

@Injectable()
export class CommentService
  extends BaseService<CommentEntity>
  implements ICommentService
{
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly postRepository: PostRepository,
    private readonly reactRepository: ReactRepository,
    private readonly eventEmitter: EventEmitter2,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    super(commentRepository.repo);
  }

  async createComment(dto: CreateCommentRequestDto): Promise<any> {
    const post = await this.postRepository.repo.findOne({
      where: { postId: dto.postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }
    const result = await this.commentRepository.repo.manager.transaction(
      async (transactionalEntityManager) => {
        const comment = transactionalEntityManager.create(CommentEntity, {
          author: { id: dto.authorId },
          post: { postId: dto.postId },
          content: dto.content,
        });
        const savedComment = await transactionalEntityManager.save(comment);

        // Update totalComments of post directly
        await transactionalEntityManager.increment(
          PostEntity,
          { postId: dto.postId },
          'totalComments',
          1,
        );

        return savedComment;
      },
    );

    // Emit comment created event for gamification
    const commentCreatedEvent = new CommentCreatedEvent();
    commentCreatedEvent.commentId = result.commentId;
    commentCreatedEvent.authorId = dto.authorId ?? '';
    commentCreatedEvent.postId = dto.postId;
    this.eventEmitter.emit(COMMENT_CREATED_EVENT, commentCreatedEvent);

    return result;
  }

  async createBusinessOwnerComment(
    dto: CreateCommentRequestDto,
    businessOwnerAccountId: string,
  ): Promise<any> {
    // Get post with location info
    const post = await this.postRepository.repo.findOne({
      where: { postId: dto.postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Validate: post must be REVIEW type
    if (post.type !== PostType.REVIEW) {
      throw new ForbiddenException('Can only comment on review posts');
    }

    // Validate: post must have locationId
    if (!post.locationId) {
      throw new ForbiddenException('Post must be a location review');
    }

    // Validate: business owner must own the location
    const location = await this.dataSource
      .getRepository(LocationEntity)
      .createQueryBuilder('location')
      .innerJoin('location.business', 'business')
      .where('location.id = :locationId', { locationId: post.locationId })
      .andWhere('business.account_id = :businessOwnerAccountId', {
        businessOwnerAccountId,
      })
      .getOne();

    if (!location) {
      throw new ForbiddenException(
        'You do not own the location for this review',
      );
    }

    // Create comment with business owner as author
    const result = await this.commentRepository.repo.manager.transaction(
      async (transactionalEntityManager) => {
        const comment = transactionalEntityManager.create(CommentEntity, {
          author: { id: businessOwnerAccountId },
          post: { postId: dto.postId },
          content: dto.content,
        });
        const savedComment = await transactionalEntityManager.save(comment);

        // Update totalComments of post directly
        await transactionalEntityManager.increment(
          PostEntity,
          { postId: dto.postId },
          'totalComments',
          1,
        );

        return savedComment;
      },
    );

    // Emit comment created event for gamification
    const commentCreatedEvent = new CommentCreatedEvent();
    commentCreatedEvent.commentId = result.commentId;
    commentCreatedEvent.authorId = businessOwnerAccountId;
    commentCreatedEvent.postId = dto.postId;
    this.eventEmitter.emit(COMMENT_CREATED_EVENT, commentCreatedEvent);

    return result;
  }

  async getCommentsByPostId(
    postId: string,
    params: PaginationParams,
    userId?: string,
  ): Promise<any> {
    const page = Math.max(params.page ?? 1, 1);
    const limit = Math.min(Math.max(params.limit ?? 10, 1), 100);
    const skip = (page - 1) * limit;

    // Get post to check if it's a location review
    const post = await this.postRepository.repo.findOne({
      where: { postId },
    });

    const queryBuilder = this.repository
      .createQueryBuilder('comment')
      .leftJoin('comment.author', 'author')
      .where('comment.post_id = :postId', { postId })
      .select([
        'comment.commentId',
        'comment.content',
        'comment.createdAt',
        'comment.updatedAt',
        'comment.totalUpvotes',
        'comment.totalDownvotes',
        'author.id',
        'author.firstName',
        'author.lastName',
        'author.avatarUrl',
      ]);

    // Get total count before applying pagination
    const total = await queryBuilder.getCount();

    // Apply pagination and get results
    const { raw, entities } = await queryBuilder
      .offset(skip)
      .limit(limit)
      .getRawAndEntities();

    // Get business owners for comments to check if they own the location
    const authorIds = entities.map((e) => e.author?.id).filter(Boolean);
    const locationNameMap = new Map<string, string>();
    const locationInfoMap = new Map<
      string,
      { id: string; avatar: string | null }
    >();

    if (
      post &&
      post.type === PostType.REVIEW &&
      post.locationId &&
      authorIds.length > 0
    ) {
      // Get location info (id, name, imageUrl)
      const location = await this.dataSource
        .getRepository(LocationEntity)
        .findOne({
          where: { id: post.locationId },
          select: ['id', 'name', 'imageUrl'],
        });

      if (location) {
        // Get first image from imageUrl array as avatar
        const locationAvatar =
          location.imageUrl && location.imageUrl.length > 0
            ? location.imageUrl[0]
            : null;

        // Check which authors are business owners of this location
        const businessOwners = await this.dataSource
          .getRepository(BusinessEntity)
          .createQueryBuilder('business')
          .innerJoin(
            LocationEntity,
            'location',
            'location.business_id = business.account_id',
          )
          .where('business.account_id IN (:...authorIds)', { authorIds })
          .andWhere('location.id = :locationId', {
            locationId: post.locationId,
          })
          .select('business.account_id', 'accountId')
          .getRawMany();

        businessOwners.forEach((bo) => {
          locationNameMap.set(bo.accountId, location.name);
          locationInfoMap.set(bo.accountId, {
            id: location.id,
            avatar: locationAvatar,
          });
        });
      }
    }

    const data = entities.map((entity) => {
      const locationName = locationNameMap.get(entity.author?.id || '') || null;
      const locationInfo = locationInfoMap.get(entity.author?.id || '');

      return {
        ...entity,
        totalUpvotes: entity.totalUpvotes || 0,
        totalDownvotes: entity.totalDownvotes || 0,
        ...(locationName && { locationName }),
        locationId: locationInfo?.id || null,
        locationAvatar: locationInfo?.avatar || null,
      };
    });

    return {
      data,
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

  async deleteComment(dto: DeleteCommentRequestDto): Promise<any> {
    const comment = await this.commentRepository.repo.findOne({
      where: { commentId: dto.commentId },
      relations: ['author', 'post'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (comment.author.id !== dto.userId) {
      throw new ForbiddenException(
        'You are not allowed to delete this comment',
      );
    }
    const post = await this.postRepository.repo.findOne({
      where: { postId: comment.post.postId },
      relations: ['author'],
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (post.author.id !== dto.userId) {
      throw new ForbiddenException(
        'You are not allowed to delete this comment',
      );
    }
    await this.commentRepository.repo.manager.transaction(
      async (transactionalEntityManager) => {
        await transactionalEntityManager.remove(comment);

        // Decrease totalComments of post directly
        await transactionalEntityManager.decrement(
          PostEntity,
          { postId: comment.post.postId },
          'totalComments',
          1,
        );

        return true;
      },
    );
    return true;
  }

  async reactComment(dto: ReactCommentRequestDto): Promise<any> {
    const comment = await this.commentRepository.repo.findOne({
      where: { commentId: dto.commentId },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const react = await this.reactRepository.repo.findOne({
      where: { entityId: dto.commentId, authorId: dto.userId },
    });

    let upvotesDelta = 0;
    let downvotesDelta = 0;

    if (react && react.type === dto.type) {
      // gỡ react
      await this.reactRepository.repo.delete(react.id);
      if (dto.type === ReactType.UPVOTE) upvotesDelta = -1;
      if (dto.type === ReactType.DOWNVOTE) downvotesDelta = -1;
    } else if (react && react.type !== dto.type) {
      // đổi react
      await this.reactRepository.repo.update(react.id, { type: dto.type });
      if (react.type === ReactType.UPVOTE && dto.type === ReactType.DOWNVOTE) {
        upvotesDelta = -1;
        downvotesDelta = +1;
      } else if (
        react.type === ReactType.DOWNVOTE &&
        dto.type === ReactType.UPVOTE
      ) {
        downvotesDelta = -1;
        upvotesDelta = +1;
      }
    } else {
      // react lần đầu
      await this.reactRepository.repo.save(
        this.reactRepository.repo.create({
          entityId: dto.commentId,
          entityType: ReactEntityType.COMMENT,
          authorId: dto.userId,
          type: dto.type,
        }),
      );
      if (dto.type === ReactType.UPVOTE) upvotesDelta = +1;
      if (dto.type === ReactType.DOWNVOTE) downvotesDelta = +1;
    }

    // update comment analytics directly
    if (upvotesDelta !== 0) {
      await this.commentRepository.repo.increment(
        { commentId: comment.commentId },
        'totalUpvotes',
        upvotesDelta,
      );
    }
    if (downvotesDelta !== 0) {
      await this.commentRepository.repo.increment(
        { commentId: comment.commentId },
        'totalDownvotes',
        downvotesDelta,
      );
    }

    return 'React comment successfully';
  }

  private async getReactionsOfComment(
    commentId: string,
    reactType: ReactType,
    params: PaginationParams = {},
  ): Promise<any> {
    try {
      const page = Math.max(params.page ?? 1, 1);
      const limit = Math.min(Math.max(params.limit ?? 10, 1), 100);
      const skip = (page - 1) * limit;

      const queryBuilder = this.reactRepository.repo
        .createQueryBuilder('react')
        .leftJoin('react.author', 'author')
        .where('react.entityId = :commentId', { commentId })
        .andWhere('react.entityType = :entityType', {
          entityType: ReactEntityType.COMMENT,
        })
        .andWhere('react.type = :type', { type: reactType })
        .select([
          'react.id',
          'react.entityId',
          'react.entityType',
          'react.type',
          'author.id',
          'author.firstName',
          'author.lastName',
          'author.avatarUrl',
        ])
        .offset(skip)
        .limit(limit);

      const [reactions, total] = await queryBuilder.getManyAndCount();
      const propertyName =
        reactType === ReactType.UPVOTE ? 'totalUpvotes' : 'totalDownvotes';

      return {
        [propertyName]: reactions.map((reaction) => reaction.author),
        meta: {
          page,
          limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getUpvotesOfComment(
    commentId: string,
    params: PaginationParams = {},
  ): Promise<any> {
    return this.getReactionsOfComment(commentId, ReactType.UPVOTE, params);
  }

  async getDownvotesOfComment(
    commentId: string,
    params: PaginationParams = {},
  ): Promise<any> {
    return this.getReactionsOfComment(commentId, ReactType.DOWNVOTE, params);
  }
}
