import { CoreService } from '@/common/core/Core.service';
import { GetPostsByLocationIdDto } from '@/common/dto/post/GetPostsByLocationId.dto';
import { GetPostsByEventIdDto } from '@/common/dto/post/GetPostsByEventId.dto';
import { PostResponseDto } from '@/common/dto/post/Post.response.dto';
import {
  IPostQueryService,
  IPostQueryService_QueryConfig,
} from '@/modules/post/app/PostQuery.service';
import { Injectable } from '@nestjs/common';
import { paginate, Paginated } from 'nestjs-paginate';
import { PostRepositoryProvider } from '@/modules/post/infra/repository/Post.repository';

@Injectable()
export class PostQueryService extends CoreService implements IPostQueryService {
  getPostsByLocationId(
    dto: GetPostsByLocationIdDto,
  ): Promise<Paginated<PostResponseDto>> {
    const postRepository = PostRepositoryProvider(this.dataSource);
    return paginate(dto.query, postRepository, {
      ...IPostQueryService_QueryConfig.getPostsByLocationId(),
      where: {
        locationId: dto.locationId,
      },
    }).then((posts) => this.mapToPaginated(PostResponseDto, posts));
  }

  getPostsByEventId(
    dto: GetPostsByEventIdDto,
  ): Promise<Paginated<PostResponseDto>> {
    const postRepository = PostRepositoryProvider(this.dataSource);
    return paginate(dto.query, postRepository, {
      ...IPostQueryService_QueryConfig.getPostsByEventId(),
      where: {
        eventId: dto.eventId,
      },
    }).then((posts) => this.mapToPaginated(PostResponseDto, posts));
  }
}
