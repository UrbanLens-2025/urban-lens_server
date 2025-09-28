import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IPostService } from '../IPost.service';
import { PostRepository } from '@/modules/post/infra/repository/Post.repository';
import { CreatePostRequestDto } from '@/common/dto/post/CreatePostRequest.dto';
import { AnalyticRepository } from '../../../analytic/infra/repository/Analytic.repository';
import {
  AnalyticEntity,
  AnalyticEntityType,
} from '@/modules/analytic/domain/Analytic.entity';
import { BaseService } from '@/common/services/base.service';
import { PostEntity } from '@/modules/post/domain/Post.entity';
import { ReactPostRequestDto } from '@/common/dto/post/ReactPostRequest.dto';
import { ReactRepository } from '@/modules/post/infra/repository/React.repository';
import {
  ReactEntity,
  ReactEntityType,
  ReactType,
} from '../../domain/React.entity';
import { DeletePostRequestDto } from '@/common/dto/post/DeletePostRequest.dto';
import { CommentRepository } from '../../infra/repository/Comment.repository';
import { CommentEntity } from '../../domain/Comment.entity';

@Injectable()
export class PostService
  extends BaseService<PostEntity>
  implements IPostService
{
  constructor(
    private readonly postRepository: PostRepository,
    private readonly analyticRepository: AnalyticRepository,
    private readonly reactRepository: ReactRepository,
    private readonly commentRepository: CommentRepository,
  ) {
    super(postRepository.repo);
  }

  async createPost(dto: CreatePostRequestDto): Promise<any> {
    try {
      const result = await this.postRepository.repo.manager.transaction(
        async (transactionalEntityManager) => {
          const post = this.postRepository.repo.create(dto);
          const savedPost = await transactionalEntityManager.save(post);
          console.log('savedPost', savedPost);
          const analytic = this.analyticRepository.repo.create({
            entityId: savedPost.postId,
            entityType: AnalyticEntityType.POST,
          });
          await transactionalEntityManager.save(analytic);
          return savedPost;
        },
      );
      return result.postId;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getPostById(postId: string, userId?: string): Promise<any> {
    try {
      const result = await this.postRepository.repo
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.author', 'author')
        .leftJoin(
          'analytic',
          'analytic',
          'analytic.entity_id::uuid = post.post_id AND analytic.entity_type = :type',
          { type: AnalyticEntityType.POST },
        )
        .where('post.post_id = :postId', { postId })
        .select([
          'post.postId',
          'post.content',
          'post.createdAt',
          'post.updatedAt',
          'author.id',
          'author.firstName',
          'author.lastName',
          'author.avatarUrl',
          'analytic.total_likes',
          'analytic.total_dislikes',
          'analytic.total_comments',
        ])
        .getRawOne();
      if (!result) {
        throw new NotFoundException('Post not found');
      }
      return result;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async reactPost(dto: ReactPostRequestDto): Promise<any> {
    try {
      const post = await this.postRepository.repo.findOne({
        where: { postId: dto.postId },
      });
      if (!post) {
        throw new NotFoundException('Post not found');
      }

      const react = await this.reactRepository.repo.findOne({
        where: {
          entityId: dto.postId,
          authorId: dto.userId,
          entityType: ReactEntityType.POST,
        },
      });

      let likesDelta = 0;
      let dislikesDelta = 0;

      if (react && react.type === dto.type) {
        await this.reactRepository.repo.delete(react.id);
        if (dto.type === ReactType.LIKE) likesDelta = -1;
        if (dto.type === ReactType.DISLIKE) dislikesDelta = -1;
      } else if (react && react.type !== dto.type) {
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
        await this.reactRepository.repo.save(
          this.reactRepository.repo.create({
            entityId: dto.postId,
            entityType: ReactEntityType.POST,
            authorId: dto.userId,
            type: dto.type,
          }),
        );
        if (dto.type === ReactType.LIKE) likesDelta = +1;
        if (dto.type === ReactType.DISLIKE) dislikesDelta = +1;
      }
      await this.analyticRepository.repo.increment(
        { entityId: post.postId, entityType: AnalyticEntityType.POST },
        'totalLikes',
        likesDelta,
      );
      await this.analyticRepository.repo.increment(
        { entityId: post.postId, entityType: AnalyticEntityType.POST },
        'totalDislikes',
        dislikesDelta,
      );

      return 'React post successfully';
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async deletePost(dto: DeletePostRequestDto): Promise<any> {
    try {
      const post = await this.postRepository.repo.findOne({
        where: { postId: dto.postId },
        relations: ['author'],
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      if (!post.author || post.author.id !== dto.userId) {
        throw new ForbiddenException('You are not allowed to delete this post');
      }

      await this.postRepository.repo.manager.transaction(async (tx) => {
        await tx.delete(CommentEntity, { post: { postId: post.postId } });
        await tx.delete(ReactEntity, {
          entityId: post.postId,
          entityType: ReactEntityType.POST,
        });
        await tx.delete(AnalyticEntity, {
          entityId: post.postId,
          entityType: AnalyticEntityType.POST,
        });
        await tx.delete(PostEntity, { postId: post.postId });
      });

      return 'Post deleted successfully';
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async getReactionsOfPost(
    postId: string,
    reactType: ReactType,
  ): Promise<any> {
    try {
      const queryBuilder = this.reactRepository.repo
        .createQueryBuilder('react')
        .leftJoin('react.author', 'author')
        .where('react.entityId = :postId', { postId })
        .andWhere('react.entityType = :entityType', {
          entityType: ReactEntityType.POST,
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
        ]);

      const [reactions, total] = await queryBuilder.getManyAndCount();
      const propertyName = reactType === ReactType.LIKE ? 'likes' : 'dislikes';
      return {
        [propertyName]: reactions.map((reaction) => reaction.author),
        total,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getLikesOfPost(postId: string): Promise<any> {
    return this.getReactionsOfPost(postId, ReactType.LIKE);
  }

  async getDislikesOfPost(postId: string): Promise<any> {
    return this.getReactionsOfPost(postId, ReactType.DISLIKE);
  }

  async getAllReactionsOfPost(postId: string): Promise<any> {
    try {
      const [likes, dislikes] = await Promise.all([
        this.getLikesOfPost(postId),
        this.getDislikesOfPost(postId),
      ]);

      return {
        likes: likes.likes,
        totalLikes: likes.total,
        dislikes: dislikes.dislikes,
        totalDislikes: dislikes.total,
        totalReactions: likes.total + dislikes.total,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
