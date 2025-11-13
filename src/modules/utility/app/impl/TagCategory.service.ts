import { Injectable } from '@nestjs/common';
import { ITagCategoryService } from '@/modules/utility/app/ITagCategory.service';
import { TagCategoryRepository } from '@/modules/utility/infra/repository/TagCategory.repository';
import { TagCategoryEntity } from '@/modules/utility/domain/TagCategory.entity';
import { CategoryType } from '@/common/constants/CategoryType.constant';

@Injectable()
export class TagCategoryService implements ITagCategoryService {
  constructor(private readonly tagCategoryRepository: TagCategoryRepository) {}

  async getAllCategories(
    categoryType?: CategoryType,
  ): Promise<
    Pick<
      TagCategoryEntity,
      'id' | 'name' | 'description' | 'color' | 'icon' | 'applicableTypes'
    >[]
  > {
    let categories = await this.tagCategoryRepository.findAll();

    // Filter by categoryType if provided - check if the type is in applicableTypes array
    if (categoryType) {
      categories = categories.filter((c) =>
        c.applicableTypes?.includes(categoryType),
      );
    }

    // Only return id, name, description, color, icon, applicableTypes - exclude tagScoreWeights
    return categories.map(
      ({ id, name, description, color, icon, applicableTypes }) => ({
        id,
        name,
        description,
        color,
        icon,
        applicableTypes,
      }),
    );
  }
}
