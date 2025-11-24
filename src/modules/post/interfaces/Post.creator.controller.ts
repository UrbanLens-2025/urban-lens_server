import { Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import {
  IPostQueryService,
  IPostQueryService_QueryConfig,
} from '@/modules/post/app/PostQuery.service';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';

@ApiTags('Post')
@ApiBearerAuth()
@Roles(Role.EVENT_CREATOR)
@Controller('/creator/posts')
export class PostCreatorController {
  constructor(
    @Inject(IPostQueryService)
    private readonly postQueryService: IPostQueryService,
  ) {}

  @ApiOperation({ summary: 'Get posts by event ID' })
  @ApiPaginationQuery(IPostQueryService_QueryConfig.getPostsByEventId())
  @Get('/event/:eventId')
  getPostsByEventId(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Paginate() query: PaginateQuery,
  ) {
    return this.postQueryService.getPostsByEventId({
      eventId,
      query,
    });
  }
}
