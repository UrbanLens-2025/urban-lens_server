import { Exclude, Expose, Type } from 'class-transformer';
import { PostType, Visibility } from '@/modules/post/domain/Post.entity';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';

@Exclude()
export class ReportTargetPostResponseDto {
  @Expose()
  postId: string;

  @Expose()
  content: string;

  @Expose()
  type: PostType;

  @Expose()
  rating: number | null;

  @Expose()
  imageUrls: string[];

  @Expose()
  locationId?: string | null;

  @Expose()
  eventId?: string | null;

  @Expose()
  visibility?: Visibility | null;

  @Expose()
  isVerified: boolean;

  @Expose()
  isHidden: boolean;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  updatedAt: Date;

  @Expose()
  authorId: string;

  @Expose()
  @Type(() => AccountResponseDto)
  author?: AccountResponseDto;
}

@Exclude()
export class ReportTargetCommentResponseDto {
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
  @Type(() => AccountResponseDto)
  author?: AccountResponseDto;
}
