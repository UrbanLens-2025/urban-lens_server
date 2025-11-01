import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
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
import { UpdateTagDto } from '@/common/dto/account/UpdateTag.dto';
import { ExistsDuplicateTagDto } from '@/common/dto/account/ExistsDuplicateTag.dto';

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

  @ApiOperation({ summary: 'Check for duplicate tag' })
  @Post('/duplicate-check')
  existsDuplicateTag(@Body() dto: ExistsDuplicateTagDto) {
    return this.tagService.existsDuplicateTag(dto);
  }

  @ApiOperation({ summary: 'Get all tags' })
  @Get()
  @ApiPaginationQuery(ITagService_QueryConfig.search())
  findAll(@Paginate() query: PaginateQuery) {
    return this.tagService.search(query);
  }

  @ApiOperation({ summary: 'Update a tag' })
  @Put('/:tagId')
  update(
    @Body() dto: UpdateTagDto,
    @Param('tagId', ParseIntPipe) tagId: number,
  ) {
    return this.tagService.update({
      ...dto,
      tagId,
    });
  }
}
