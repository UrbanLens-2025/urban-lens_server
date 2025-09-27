import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ICommentService } from '../IComment.service';
import { CreateCommentRequestDto } from '@/common/dto/post/CreateCommentRequest.dto';
import { CommentRepository } from '../../infra/repository/Comment.repository';
import { AnalyticRepository } from '../../../analytic/infra/repository/Analytic.repository';
import { BaseService, PaginationParams } from '@/common/services/base.service';
import { CommentEntity } from '../../domain/Comment.entity';
import { PostRepository } from '../../infra/repository/Post.repository';
import { AnalyticEntityType } from '@/modules/analytic/domain/Analytic.entity';
import { ReactRepository } from '../../infra/repository/React.repository';
import { ReactCommentRequestDto } from '@/common/dto/post/ReactCommentRequest.dto';
import { ReactEntityType, ReactType } from '../../domain/React.entity';
import { DeleteCommentRequestDto } from '@/common/dto/post/DeleteCommentRequest.dto';

@Injectable()
export class CommentService
  extends BaseService<CommentEntity>
  implements ICommentService
{
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly analyticRepository: AnalyticRepository,
    private readonly postRepository: PostRepository,
    private readonly reactRepository: ReactRepository,
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
        const analytic = this.analyticRepository.repo.create({
          entityId: savedComment.commentId,
          entityType: AnalyticEntityType.COMMENT,
        });
        await transactionalEntityManager.save(analytic);
        return savedComment;
      },
    );
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

    const queryBuilder = this.repository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .leftJoin(
        'analytic',
        'analytic',
        `analytic.entity_id::uuid = comment.comment_id AND analytic.entity_type = :type`,
        { type: AnalyticEntityType.COMMENT },
      )
      .where('comment.post_id = :postId', { postId })
      .select([
        'comment.commentId',
        'comment.content',
        'comment.createdAt',
        'comment.updatedAt',
        'author.id',
        'author.firstName',
        'author.lastName',
        'author.avatarUrl',
        'analytic.total_likes',
        'analytic.total_dislikes',
      ])
      .skip(skip)
      .take(limit);

    const { raw, entities } = await queryBuilder.getRawAndEntities();

    const data = entities.map((entity, index) => {
      const row = raw[index];
      return {
        ...entity,
        totalLikes: Number(row.analytic_total_likes) || 0,
        totalDislikes: Number(row.analytic_total_dislikes) || 0,
      };
    });

    const total = await queryBuilder.getCount();

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
        await transactionalEntityManager.remove(
          await this.analyticRepository.repo.findOne({
            where: {
              entityId: dto.commentId,
              entityType: AnalyticEntityType.COMMENT,
            },
          }),
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

    let likesDelta = 0;
    let dislikesDelta = 0;

    if (react && react.type === dto.type) {
      // gỡ react
      await this.reactRepository.repo.delete(react.id);
      if (dto.type === ReactType.LIKE) likesDelta = -1;
      if (dto.type === ReactType.DISLIKE) dislikesDelta = -1;
    } else if (react && react.type !== dto.type) {
      // đổi react
      await this.reactRepository.repo.update(react.id, { type: dto.type });
      if (react.type === ReactType.LIKE && dto.type === ReactType.DISLIKE) {
        likesDelta = -1;
        dislikesDelta = +1;
      } else if (
        react.type === ReactType.DISLIKE &&
        dto.type === ReactType.LIKE
      ) {
        dislikesDelta = -1;
        likesDelta = +1;
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
      if (dto.type === ReactType.LIKE) likesDelta = +1;
      if (dto.type === ReactType.DISLIKE) dislikesDelta = +1;
    }

    // update analytic
    if (likesDelta !== 0) {
      await this.analyticRepository.repo.increment(
        { entityId: comment.commentId, entityType: AnalyticEntityType.COMMENT },
        'totalLikes',
        likesDelta,
      );
    }
    if (dislikesDelta !== 0) {
      await this.analyticRepository.repo.increment(
        { entityId: comment.commentId, entityType: AnalyticEntityType.COMMENT },
        'totalDislikes',
        dislikesDelta,
      );
    }

    return 'React comment successfully';
  }
}
