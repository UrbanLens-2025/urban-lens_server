import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class PostAnalyticsResponseDto {
  @Expose()
  totalUpvotes: number;

  @Expose()
  totalDownvotes: number;

  @Expose()
  totalComments: number;
}

