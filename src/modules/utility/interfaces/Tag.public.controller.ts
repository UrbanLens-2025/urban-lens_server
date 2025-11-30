import { ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import { Controller, Get, Inject, Query } from '@nestjs/common';
import {
  ITagService,
  ITagService_QueryConfig,
} from '@/modules/utility/app/ITag.service';
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

  @ApiOperation({ summary: 'Get popular tags used in locations' })
  @Get('popular/location')
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of tags to return (default: 20)',
    example: 20,
  })
  getPopularLocationTags(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.tagService.getPopularLocationTags(limitNum);
  }

  @ApiOperation({ summary: 'Get popular tags used in events' })
  @Get('popular/event')
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of tags to return (default: 20)',
    example: 20,
  })
  getPopularEventTags(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.tagService.getPopularEventTags(limitNum);
  }
}
