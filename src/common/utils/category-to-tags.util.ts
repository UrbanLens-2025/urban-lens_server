import { DataSource, In } from 'typeorm';
import { TagCategoryEntity } from '@/modules/utility/domain/TagCategory.entity';
import { CategoryType } from '@/common/constants/CategoryType.constant';

/**
 * Convert category IDs to tag IDs based on category weights
 * @param categoryIds - Array of category IDs
 * @param categoryType - Type of category to filter by
 * @param dataSource - TypeORM DataSource for database queries
 * @returns Array of unique tag IDs with high weights
 */
export async function convertCategoriesToTagIds(
  categoryIds: number[],
  categoryType: CategoryType,
  dataSource: DataSource,
): Promise<number[]> {
  if (!categoryIds || categoryIds.length === 0) {
    return [];
  }

  const categoryRepo = dataSource.getRepository(TagCategoryEntity);

  // Fetch categories with matching IDs
  const allCategories = await categoryRepo.find({
    where: {
      id: In(categoryIds),
    },
  });

  // Filter categories that have the requested type in their applicableTypes array
  const categories = allCategories.filter((c) =>
    c.applicableTypes?.includes(categoryType),
  );

  if (categories.length === 0) {
    return [];
  }

  // Aggregate tag scores from all categories
  const tagScores: Map<number, number> = new Map();

  for (const category of categories) {
    const weights = category.tagScoreWeights;

    for (const [tagKey, score] of Object.entries(weights)) {
      // Extract tag ID from key like "tag_107"
      const tagId = parseInt(tagKey.replace('tag_', ''));

      if (!isNaN(tagId) && score > 0) {
        // Only include tags with positive scores
        const currentScore = tagScores.get(tagId) || 0;
        tagScores.set(tagId, currentScore + score);
      }
    }
  }

  // Sort by score and return tag IDs
  const sortedTags = Array.from(tagScores.entries())
    .sort((a, b) => b[1] - a[1]) // Sort by score descending
    .map((entry) => entry[0]);

  return sortedTags;
}

/**
 * Merge category-based tags with manually selected tags
 * @param manualTagIds - Manually selected tag IDs
 * @param categoryIds - Category IDs to convert
 * @param categoryType - Type of category
 * @param dataSource - TypeORM DataSource
 * @returns Array of unique tag IDs
 */
export async function mergeTagsWithCategories(
  manualTagIds: number[],
  categoryIds: number[] | undefined,
  categoryType: CategoryType,
  dataSource: DataSource,
): Promise<number[]> {
  const categoryTagIds = categoryIds
    ? await convertCategoriesToTagIds(categoryIds, categoryType, dataSource)
    : [];

  // Merge and deduplicate
  const allTagIds = [...new Set([...manualTagIds, ...categoryTagIds])];

  return allTagIds;
}
