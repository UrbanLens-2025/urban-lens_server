import { CoreService } from '@/common/core/Core.service';
import { CreateTagDto } from '@/common/dto/account/CreateTag.dto';
import { TagResponseDto } from '@/common/dto/account/res/TagResponse.dto';
import {
  ITagService,
  ITagService_QueryConfig,
} from '@/modules/utility/app/ITag.service';
import { ConflictException, Injectable } from '@nestjs/common';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { TagEntity } from '@/modules/utility/domain/Tag.entity';
import { TagRepositoryProvider } from '@/modules/utility/infra/repository/Tag.repository';
import { UpdateTagDto } from '@/common/dto/account/UpdateTag.dto';
import { UpdateResult } from 'typeorm';
import { ExistsDuplicateTagDto } from '@/common/dto/account/ExistsDuplicateTag.dto';
import { PopularTagResponseDto } from '@/common/dto/utility/res/PopularTagResponse.dto';
import { LocationTagsEntity } from '@/modules/business/domain/LocationTags.entity';
import { EventTagsEntity } from '@/modules/event/domain/EventTags.entity';

@Injectable()
export class TagService extends CoreService implements ITagService {
  constructor() {
    super();
  }

  async create(dto: CreateTagDto): Promise<TagResponseDto[]> {
    return this.dataSource.transaction(async (manager) => {
      const tagRepository = TagRepositoryProvider(manager);

      const existsDuplicate = await tagRepository.findDuplicates({
        items: dto.list.map((item) => ({
          displayName: item.displayName,
          groupName: item.groupName,
        })),
      });

      if (existsDuplicate && existsDuplicate.length > 0) {
        throw new ConflictException(
          'One or more tags with the same display name and group name already exist',
        );
      }

      const tags = dto.list.map((item) => this.mapTo_safe(TagEntity, item));
      return tagRepository
        .save(tags)
        .then((res) => this.mapToArray(TagResponseDto, res));
    });
  }

  async search(query: PaginateQuery): Promise<Paginated<TagResponseDto>> {
    const tagRepository = this.dataSource.getRepository(TagEntity);
    return paginate(query, tagRepository, {
      ...ITagService_QueryConfig.search(),
    });
  }

  searchSelectable(query: PaginateQuery): Promise<Paginated<TagResponseDto>> {
    const tagRepository = this.dataSource.getRepository(TagEntity);
    return paginate(query, tagRepository, {
      ...ITagService_QueryConfig.search(),
      where: {
        isSelectable: true,
      },
    });
  }

  update(dto: UpdateTagDto): Promise<UpdateResult> {
    return this.ensureTransaction(null, async (em) => {
      const tagRepository = TagRepositoryProvider(em);

      const tag = await tagRepository.findOneOrFail({
        where: { id: dto.tagId },
      });

      // checks
      if (
        (dto.displayName || dto.groupName) &&
        (dto.displayName !== tag.displayName || dto.groupName !== tag.groupName)
      ) {
        const existsDuplicate = await tagRepository.findDuplicates({
          items: [
            {
              displayName: tag.displayName,
              groupName: tag.groupName,
            },
          ],
        });

        if (existsDuplicate && existsDuplicate.length > 0) {
          throw new ConflictException(
            'Another tag with the same display name and group name already exists',
          );
        }
      }

      // map to tag
      this.assignTo_safe(tag, dto);

      return tagRepository.update({ id: dto.tagId }, tag);
    });
  }

  existsDuplicateTag(dto: ExistsDuplicateTagDto): Promise<boolean> {
    const tagRepository = TagRepositoryProvider(this.dataSource);
    return tagRepository
      .findDuplicates({
        items: [dto],
      })
      .then((res) => res.length > 0);
  }

  async getPopularLocationTags(
    limit: number = 20,
  ): Promise<PopularTagResponseDto[]> {
    const locationTagsRepo = this.dataSource.getRepository(LocationTagsEntity);

    const popularTags = await locationTagsRepo
      .createQueryBuilder('locationTag')
      .leftJoin('locationTag.tag', 'tag')
      .select('tag.id', 'tag_id')
      .addSelect('tag.groupName', 'tag_group_name')
      .addSelect('tag.displayName', 'tag_display_name')
      .addSelect('tag.color', 'tag_color')
      .addSelect('tag.icon', 'tag_icon')
      .addSelect('tag.isSelectable', 'tag_is_selectable')
      .addSelect('COUNT(DISTINCT locationTag.locationId)', 'usageCount')
      .where('locationTag.deletedAt IS NULL')
      .groupBy('tag.id')
      .addGroupBy('tag.groupName')
      .addGroupBy('tag.displayName')
      .addGroupBy('tag.color')
      .addGroupBy('tag.icon')
      .addGroupBy('tag.isSelectable')
      .orderBy('COUNT(DISTINCT locationTag.locationId)', 'DESC')
      .addOrderBy('tag.displayName', 'ASC')
      .limit(limit)
      .getRawMany();

    return popularTags.map((tag) =>
      this.mapTo(PopularTagResponseDto, {
        id: tag.tag_id,
        groupName: tag.tag_group_name,
        displayName: tag.tag_display_name,
        color: tag.tag_color,
        icon: tag.tag_icon,
        isSelectable: tag.tag_is_selectable,
        usageCount: parseInt(tag.usageCount || '0', 10),
      }),
    );
  }

  async getPopularEventTags(
    limit: number = 20,
  ): Promise<PopularTagResponseDto[]> {
    const eventTagsRepo = this.dataSource.getRepository(EventTagsEntity);

    const popularTags = await eventTagsRepo
      .createQueryBuilder('eventTag')
      .leftJoin('eventTag.tag', 'tag')
      .select('tag.id', 'tag_id')
      .addSelect('tag.groupName', 'tag_group_name')
      .addSelect('tag.displayName', 'tag_display_name')
      .addSelect('tag.color', 'tag_color')
      .addSelect('tag.icon', 'tag_icon')
      .addSelect('tag.isSelectable', 'tag_is_selectable')
      .addSelect('COUNT(DISTINCT eventTag.eventId)', 'usageCount')
      .where('eventTag.deletedAt IS NULL')
      .groupBy('tag.id')
      .addGroupBy('tag.groupName')
      .addGroupBy('tag.displayName')
      .addGroupBy('tag.color')
      .addGroupBy('tag.icon')
      .addGroupBy('tag.isSelectable')
      .orderBy('COUNT(DISTINCT eventTag.eventId)', 'DESC')
      .addOrderBy('tag.displayName', 'ASC')
      .limit(limit)
      .getRawMany();

    return popularTags.map((tag) =>
      this.mapTo(PopularTagResponseDto, {
        id: tag.tag_id,
        groupName: tag.tag_group_name,
        displayName: tag.tag_display_name,
        color: tag.tag_color,
        icon: tag.tag_icon,
        isSelectable: tag.tag_is_selectable,
        usageCount: parseInt(tag.usageCount || '0', 10),
      }),
    );
  }
}
