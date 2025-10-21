import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Inject } from '@nestjs/common';
import { ITagService } from '@/modules/utility/app/ITag.service';
import { WithPagination } from '@/common/WithPagination.decorator';
import { Paginate, type PaginateQuery } from 'nestjs-paginate';

@ApiTags('Tag')
@Controller('/public/tag')
export class TagPublicController {
  constructor(
    @Inject(ITagService)
    private readonly tagService: ITagService,
  ) {}

  @Get()
  @WithPagination()
  getTags(@Paginate() query: PaginateQuery) {
    return this.tagService.search(query);
  }
}
