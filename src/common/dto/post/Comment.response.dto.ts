import { Exclude, Expose, Type } from 'class-transformer';
import { ReactType } from '@/modules/post/domain/React.entity';
import { PostAuthorResponseDto } from './Post.response.dto';

@Exclude()
export class CommentAnalyticsResponseDto {
  @Expose()
  totalUpvotes: number;

  @Expose()
  totalDownvotes: number;
}

@Exclude()
export class CommentResponseDto {
  @Expose()
  commentId: string;

  @Expose()
  content: string;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  updatedAt: Date;

  @Expose()
  @Type(() => PostAuthorResponseDto)
  author: PostAuthorResponseDto;

  @Expose()
  @Type(() => CommentAnalyticsResponseDto)
  analytics: CommentAnalyticsResponseDto;

  @Expose()
  currentUserReaction: ReactType | null;
}
