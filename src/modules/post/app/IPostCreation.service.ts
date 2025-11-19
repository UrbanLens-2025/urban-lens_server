import { CreatePostDto } from '@/common/dto/post/CreatePost.dto';
import { CreateCommentRequestDto } from '@/common/dto/post/CreateComment.dto';
import { CommentResponseDto } from '@/common/dto/post/res/CommentResponse.dto';
import { PostResponseDto } from '@/common/dto/post/res/PostResponse.dto';
import { CreateBlogDto } from '@/common/dto/post/CreateBlog.dto';
import { CreateLocationReviewDto } from '@/common/dto/post/CreateLocationReview.dto';

export const IPostCreationService = Symbol('IPostCreationService');

export interface IPostCreationService {
  createPost(dto: CreatePostDto): Promise<string>;
  createComment(dto: CreateCommentRequestDto): Promise<CommentResponseDto>;

  createBlog(dto: CreateBlogDto): Promise<PostResponseDto>;
  createLocationReview(dto: CreateLocationReviewDto): Promise<PostResponseDto>;
}
