import { Exclude, Expose, Type } from 'class-transformer';
import { PostType, Visibility } from '@/modules/post/domain/Post.entity';
import { ReactType } from '@/modules/post/domain/React.entity';

@Exclude()
export class PostAuthorResponseDto {
  @Expose()
  id: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  avatarUrl: string | null;

  @Expose()
  isFollow: boolean;
}

@Exclude()
export class PostAnalyticsResponseDto {
  @Expose()
  totalUpvotes: number;

  @Expose()
  totalDownvotes: number;

  @Expose()
  totalComments: number;
}

@Exclude()
export class PostLocationResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  addressLine: string;

  @Expose()
  latitude: number | null;

  @Expose()
  longitude: number | null;

  @Expose()
  imageUrl: string[] | null;
}

@Exclude()
export class PostResponseDto {
  @Expose()
  postId: string;

  @Expose()
  content: string;

  @Expose()
  imageUrls: string[];

  @Expose()
  type: PostType;

  @Expose()
  isVerified: boolean;

  @Expose()
  visibility: Visibility | null;

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
  @Type(() => PostAnalyticsResponseDto)
  analytics: PostAnalyticsResponseDto;

  @Expose()
  currentUserReaction: ReactType | null;

  @Expose()
  rating?: number;

  @Expose()
  @Type(() => PostLocationResponseDto)
  location?: PostLocationResponseDto;

  @Expose()
  eventId?: string;
}
