import { PostResponseDto } from '@/common/dto/post/Post.response.dto';
import { Paginated, PaginateConfig, PaginateQuery } from 'nestjs-paginate';
import { PostEntity } from '@/modules/post/domain/Post.entity';
import { GetPostsByLocationIdDto } from '@/common/dto/post/GetPostsByLocationId.dto';
import { GetPostsByEventIdDto } from '@/common/dto/post/GetPostsByEventId.dto';

export const IPostQueryService = Symbol('IPostQueryService');
export interface IPostQueryService {
  getPostsByLocationId(
    dto: GetPostsByLocationIdDto,
  ): Promise<Paginated<PostResponseDto>>;

  getPostsByEventId(
    dto: GetPostsByEventIdDto,
  ): Promise<Paginated<PostResponseDto>>;
}

export namespace IPostQueryService_QueryConfig {
  export function getPostsByLocationId(): PaginateConfig<PostEntity> {
    return {
      sortableColumns: ['createdAt', 'updatedAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      relations: {
        author: true,
      },
    };
  }

  export function getPostsByEventId(): PaginateConfig<PostEntity> {
    return {
      sortableColumns: ['createdAt', 'updatedAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      relations: {
        author: true,
      },
    };
  }
}
