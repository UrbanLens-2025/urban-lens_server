import { DataSource, EntityManager, Repository } from 'typeorm';
import { TagEntity } from '@/modules/account/domain/Tag.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TagRepository {
  constructor(
    @InjectRepository(TagEntity) public readonly repo: Repository<TagEntity>,
  ) {}
}

export const TagRepositoryProvider = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(TagEntity).extend({
    existsSelectableTagsById(
      this: Repository<TagEntity>,
      tagIds?: number[] | null,
    ): Promise<boolean> {
      if (!tagIds || tagIds.length === 0) {
        return Promise.resolve(true);
      }

      return this.createQueryBuilder('tag')
        .whereInIds(tagIds)
        .andWhere('tag.is_selectable = true')
        .getExists();
    },

    existsDuplicate(
      this: Repository<TagEntity>,
      payload: {
        items: {
          groupName: string;
          displayName: string;
        }[];
      },
    ) {
      const qb = this.createQueryBuilder('tag');

      payload.items.forEach((item, index) => {
        const condition = `(tag.group_name = :groupName${index} AND tag.display_name = :displayName${index})`;
        if (index === 0) {
          qb.where(condition, {
            [`groupName${index}`]: item.groupName,
            [`displayName${index}`]: item.displayName,
          });
        } else {
          qb.orWhere(condition, {
            [`groupName${index}`]: item.groupName,
            [`displayName${index}`]: item.displayName,
          });
        }
      });

      return qb.getExists();
    },
  });

export type TagRepositoryProvider = ReturnType<typeof TagRepositoryProvider>;
