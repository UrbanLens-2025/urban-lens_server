import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ITagCategoryService } from '@/modules/utility/app/ITagCategory.service';
import { TagCategoryResponseDto } from '@/common/dto/utility/TagCategory.dto';
import { CategoryType } from '@/common/constants/CategoryType.constant';

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
      'Returns all available tag categories. Can be filtered by type (USER, LOCATION, EVENT). ' +
      'These can be used for user onboarding, location categorization, or event categorization.',
  })
  @ApiQuery({
    name: 'type',
    enum: CategoryType,
    required: false,
    description: 'Filter by category type (USER, LOCATION, EVENT, ALL)',
    example: CategoryType.USER,
  })
  @Get()
  async getAllCategories(
    @Query('type') type?: CategoryType,
  ): Promise<TagCategoryResponseDto[]> {
    return this.tagCategoryService.getAllCategories(type);
  }
}
