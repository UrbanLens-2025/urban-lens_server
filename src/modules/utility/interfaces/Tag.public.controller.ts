import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Inject } from '@nestjs/common';
import {
  ITagService,
  ITagService_QueryConfig,
} from '@/modules/utility/app/ITag.service';
import { WithPagination } from '@/common/WithPagination.decorator';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';

@ApiTags('Tag')
@Controller('/public/tag')
export class TagPublicController {
  constructor(
    @Inject(ITagService)
    private readonly tagService: ITagService,
  ) {}

  @ApiOperation({ summary: 'Get all selectable tags' })
  @Get()
  @ApiPaginationQuery(ITagService_QueryConfig.searchSelectable())
  getTags(@Paginate() query: PaginateQuery) {
    return this.tagService.searchSelectable(query);
  }
}
