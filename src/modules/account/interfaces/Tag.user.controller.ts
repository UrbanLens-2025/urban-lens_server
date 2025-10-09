import { Controller, Get, Inject } from '@nestjs/common';
import { Paginate, type PaginateQuery } from 'nestjs-paginate';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ITagUserService } from '@/modules/account/app/ITag.user.service';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { WithPagination } from '@/common/WithPagination.decorator';

@Roles(Role.USER)
@ApiBearerAuth()
@ApiTags('Tag - User')
@Controller('/user/tag')
export class TagUserController {
  constructor(
    @Inject(ITagUserService)
    private readonly tagUserService: ITagUserService,
  ) {}

  @Get()
  @WithPagination()
  getTags(@Paginate() query: PaginateQuery) {
    return this.tagUserService.listTags(query);
  }
}
