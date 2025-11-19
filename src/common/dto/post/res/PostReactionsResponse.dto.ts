import { Exclude, Expose, Type } from 'class-transformer';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';

@Exclude()
export class PostReactionsResponseDto {
  @Expose()
  @Type(() => AccountResponseDto)
  upvotes: AccountResponseDto[];

  @Expose()
  totalUpvotes: number;

  @Expose()
  @Type(() => AccountResponseDto)
  downvotes: AccountResponseDto[];

  @Expose()
  totalDownvotes: number;

  @Expose()
  totalReactions: number;
}

