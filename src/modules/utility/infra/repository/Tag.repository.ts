import { DataSource, EntityManager, Repository } from 'typeorm';
import { TagEntity } from '@/modules/utility/domain/Tag.entity';

export const TagRepositoryProvider = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(TagEntity).extend({
    countSelectableTagsById(
      this: Repository<TagEntity>,
      tagIds?: number[] | null,
    ) {
      if (!tagIds || tagIds.length === 0) {
        return Promise.resolve(0);
      }

      return this.createQueryBuilder('tag')
        .whereInIds(tagIds)
        .andWhere('tag.is_selectable = :isSelectable', { isSelectable: true })
        .getCount();
    },

    findDuplicates(
      this: Repository<TagEntity>,
      payload: { items: { groupName: string; displayName: string }[] },
    ) {
      const qb = this.createQueryBuilder('tag');

      payload.items.forEach((item, index) => {
        const condition = `(tag.group_name = :groupName${index} AND tag.display_name_normalized = :displayName${index})`;
        const payload = {
          [`groupName${index}`]: item.groupName,
          [`displayName${index}`]: item.displayName.trim().toLowerCase(),
        };
        if (index === 0) {
          qb.where(condition, payload);
        } else {
          qb.orWhere(condition, payload);
        }
      });

      return qb.getMany();
    },
  });

export type TagRepositoryProvider = ReturnType<typeof TagRepositoryProvider>;
