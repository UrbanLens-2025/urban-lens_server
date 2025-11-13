import { TagCategoryEntity } from '@/modules/utility/domain/TagCategory.entity';
import { CategoryType } from '@/common/constants/CategoryType.constant';

export const ITagCategoryService = Symbol('ITagCategoryService');

export interface ITagCategoryService {
  /**
   * Get all tag categories (without tagScoreWeights)
   * @param categoryType - Optional filter by category type
   */
  getAllCategories(
    categoryType?: CategoryType,
  ): Promise<
    Pick<
      TagCategoryEntity,
      'id' | 'name' | 'description' | 'color' | 'icon' | 'applicableTypes'
    >[]
  >;
}
