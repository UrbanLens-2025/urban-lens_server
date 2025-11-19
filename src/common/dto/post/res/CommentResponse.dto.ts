import { Exclude, Expose, Type } from 'class-transformer';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';

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
  @Type(() => AccountResponseDto)
  author: AccountResponseDto;

  @Expose()
  totalUpvotes: number;

  @Expose()
  totalDownvotes: number;
}

