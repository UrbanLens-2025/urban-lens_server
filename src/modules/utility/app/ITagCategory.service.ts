import { TagCategoryEntity } from '@/modules/utility/domain/TagCategory.entity';

export const ITagCategoryService = Symbol('ITagCategoryService');

export interface ITagCategoryService {
  /**
   * Get all tag categories (without tagScoreWeights)
   */
  getAllCategories(): Promise<
    Pick<TagCategoryEntity, 'id' | 'name' | 'description' | 'color' | 'icon'>[]
  >;
}
