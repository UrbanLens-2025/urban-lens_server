import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateTag } from '@/common/dto/account/CreateTag.dto';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { Paginate, type PaginateQuery } from 'nestjs-paginate';
import { WithPagination } from '@/common/WithPagination.decorator';
import { ITagService } from '@/modules/account/app/ITag.service';

@ApiBearerAuth()
@Roles(Role.ADMIN)
@ApiTags('Tag - Admin')
@Controller('/admin/tag')
export class TagAdminController {
  constructor(
    @Inject(ITagService)
    private readonly tagService: ITagService,
  ) {}

  @Post()
  create(@Body() dto: CreateTag.Dto) {
    return this.tagService.create(dto);
  }

  @Get()
  @WithPagination()
  findAll(@Paginate() query: PaginateQuery) {
    return this.tagService.search(query);
  }
}
