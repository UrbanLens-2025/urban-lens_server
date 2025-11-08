import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ITagCategoryService } from '@/modules/utility/app/ITagCategory.service';
import { TagCategoryResponseDto } from '@/common/dto/utility/TagCategory.dto';

@ApiTags('Tag Categories')
@Controller('/public/tag-categories')
export class TagCategoryController {
  constructor(
    @Inject(ITagCategoryService)
    private readonly tagCategoryService: ITagCategoryService,
  ) {}

  @ApiOperation({
    summary: 'Get all tag categories',
    description:
      'Returns all available tag categories with their score weights. These can be used for user preference matching.',
  })
  @Get()
  async getAllCategories(): Promise<TagCategoryResponseDto[]> {
    return this.tagCategoryService.getAllCategories();
  }
}
