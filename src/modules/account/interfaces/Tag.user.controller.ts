import { Controller, Get, Inject } from '@nestjs/common';
import { Paginate, type PaginateQuery } from 'nestjs-paginate';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ITagUserService } from '@/modules/account/app/ITag.user.service';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';

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
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    isArray: true,
    example: ['name:ASC'],
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'filter', required: false, type: String, isArray: true })
  getTags(@Paginate() query: PaginateQuery) {
    return this.tagUserService.listTags(query);
  }
}
