import { Exclude, Expose, Type } from 'class-transformer';
import { PostType, Visibility } from '@/modules/post/domain/Post.entity';
import { LocationResponseDto } from '@/common/dto/business/res/Location.response.dto';
import { PostAuthorResponseDto } from '@/common/dto/post/res/PostAuthorResponse.dto';
import { PostAnalyticsResponseDto } from '@/common/dto/post/res/PostAnalyticsResponse.dto';

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
  rating?: number;

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
  currentUserReaction?: string | null;

  @Expose()
  locationId?: string | null;

  @Expose()
  @Type(() => LocationResponseDto)
  location?: LocationResponseDto | null;

  @Expose()
  eventId?: string | null;
}
