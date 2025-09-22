import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IPostService } from '../IPost.service';
import {
  PostRepository,
  PostSummaryRepository,
} from '../../infra/repository/Post.repository';
import { CreatePostRequestDto } from '@/common/dto/post/CreatePostRequest.dto';

@Injectable()
export class PostService implements IPostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly postSummaryRepository: PostSummaryRepository,
  ) {}

  async createPost(dto: CreatePostRequestDto): Promise<any> {
    try {
      const result = await this.postRepository.repo.manager.transaction(
        async (transactionalEntityManager) => {
          const post = this.postRepository.repo.create(dto);
          await transactionalEntityManager.save(post);
          const postSummary = this.postSummaryRepository.repo.create({
            postId: post.postId,
          });
          await transactionalEntityManager.save(postSummary);
        },
      );
      return result;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
    // if(dto.locationId){
    //   const location = await this.locationRepository.repo.findOne({
    //     where: { locationId: dto.locationId },
    //   });
    //   if(!location){
    //     throw new NotFoundException('Location not found');
    //   }
    // }
  }

  async getPostById(postId: string): Promise<any> {
    try {
      const result = await this.postRepository.repo
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.author', 'author')
        .leftJoinAndSelect('post.comments', 'comments')
        .leftJoinAndSelect('post.postSummary', 'postSummary')
        .where('post.postId = :postId', { postId })
        .getOne();
      if (!result) {
        throw new NotFoundException('Post not found');
      }
      return result;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }
}
