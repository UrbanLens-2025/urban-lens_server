import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CategoryType } from '@/common/constants/CategoryType.constant';

/**
 * TagCategory represents a predefined preference profile
 * Each category defines how much each tag should be weighted
 *
 * Example:
 * - "Thích yên tĩnh": { "tag_2": 10, "tag_5": 8, "tag_7": -5 }
 * - "Thích sôi động": { "tag_7": 10, "tag_9": 8, "tag_2": -5 }
 */
@Entity('tag_category')
export class TagCategoryEntity {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  color?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon?: string;

  /**
   * Applicable types - defines which entities this category can be used for
   * Array can include: USER, LOCATION, EVENT
   * Example: ['USER', 'LOCATION'] means this category can be used for both user onboarding and location categorization
   */
  @Column({
    name: 'applicable_types',
    type: 'jsonb',
    default: () => '\'["USER"]\'',
  })
  applicableTypes: CategoryType[];

  /**
   * JSONB mapping of tag_id to score weight
   * Positive values = preference for this tag
   * Negative values = avoidance of this tag
   * Zero or missing = neutral
   *
   * Example: { "tag_2": 10, "tag_5": 8, "tag_7": -5, "tag_9": -3 }
   */
  @Column({ name: 'tag_score_weights', type: 'jsonb', default: {} })
  tagScoreWeights: Record<string, number>;

  @Column({
    name: 'created_at',
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
