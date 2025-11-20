import { CreatePostDto } from '@/common/dto/post/CreatePost.dto';
import { CreateCommentRequestDto } from '@/common/dto/post/CreateComment.dto';
import { CommentResponseDto } from '@/common/dto/post/res/CommentResponse.dto';
import { PostResponseDto } from '@/common/dto/post/res/PostResponse.dto';
import { CreateBlogDto } from '@/common/dto/post/CreateBlog.dto';
import { CreateLocationReviewDto } from '@/common/dto/post/CreateLocationReview.dto';
import { CreateEventReviewDto } from '@/common/dto/post/CreateEventReview.dto';
import { ReactPostDto } from '@/common/dto/post/ReactPost.dto';
import { ReactCommentRequestDto } from '@/common/dto/post/ReactComment.dto';

export const IPostCreationService = Symbol('IPostCreationService');

export interface IPostCreationService {
  createBlog(dto: CreateBlogDto): Promise<PostResponseDto>;
  createLocationReview(dto: CreateLocationReviewDto): Promise<PostResponseDto>;
  createEventReview(dto: CreateEventReviewDto): Promise<PostResponseDto>;

  createComment(dto: CreateCommentRequestDto): Promise<CommentResponseDto>;

  addInteractionToPost(dto: ReactPostDto): Promise<void>;

  addInteractionToComment(dto: ReactCommentRequestDto): Promise<void>;
}
