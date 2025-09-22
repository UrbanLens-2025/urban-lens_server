import { CreatePostRequestDto } from '@/common/dto/post/CreatePostRequest.dto';
import { PostEntity } from '../domain/Post.entity';

export const IPostService = Symbol('IPostService');
export interface IPostService {
  createPost(dto: CreatePostRequestDto): Promise<any>;
  getPostById(postId: string): Promise<any>;
}
