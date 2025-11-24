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
@Roles(Role.BUSINESS_OWNER)
@Controller('/owner/posts')
export class PostOwnerController {
  constructor(
    @Inject(IPostQueryService)
    private readonly postQueryService: IPostQueryService,
  ) {}

  @ApiOperation({ summary: 'Get posts by location ID' })
  @ApiPaginationQuery(IPostQueryService_QueryConfig.getPostsByLocationId())
  @Get('/location/:locationId')
  getPostsByLocationId(
    @Param('locationId', ParseUUIDPipe) locationId: string,
    @Paginate() query: PaginateQuery,
  ) {
    return this.postQueryService.getPostsByLocationId({
      locationId,
      query,
    });
  }
}
