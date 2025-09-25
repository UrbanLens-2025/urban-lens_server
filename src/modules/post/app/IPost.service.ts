import { CreatePostRequestDto } from '@/common/dto/post/CreatePostRequest.dto';
import { ReactPostRequestDto } from '@/common/dto/post/ReactPostRequest.dto';

export const IPostService = Symbol('IPostService');
export interface IPostService {
  createPost(dto: CreatePostRequestDto): Promise<any>;
  getPostById(postId: string): Promise<any>;
  reactPost(dto: ReactPostRequestDto): Promise<any>;
}
