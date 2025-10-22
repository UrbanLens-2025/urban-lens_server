import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateTagDto } from '@/common/dto/account/CreateTag.dto';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';
import {
  ITagService,
  ITagService_QueryConfig,
} from '@/modules/utility/app/ITag.service';

@ApiBearerAuth()
@Roles(Role.ADMIN)
@ApiTags('Tag')
@Controller('/admin/tag')
export class TagAdminController {
  constructor(
    @Inject(ITagService)
    private readonly tagService: ITagService,
  ) {}

  @ApiOperation({ summary: 'Create a new tag' })
  @Post()
  create(@Body() dto: CreateTagDto) {
    return this.tagService.create(dto);
  }

  @ApiOperation({ summary: 'Get all tags' })
  @Get()
  @ApiPaginationQuery(ITagService_QueryConfig.search())
  findAll(@Paginate() query: PaginateQuery) {
    return this.tagService.search(query);
  }
}
