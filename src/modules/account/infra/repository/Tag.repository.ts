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
  });

export type TagRepositoryProvider = ReturnType<typeof TagRepositoryProvider>;
