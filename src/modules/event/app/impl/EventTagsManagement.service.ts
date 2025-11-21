import { CoreService } from '@/common/core/Core.service';
import { EventTagsResponseDto } from '@/common/dto/event/res/EventTags.response.dto';
import { AddEventTagDto } from '@/common/dto/event/AddEventTag.dto';
import { RemoveEventTagDto } from '@/common/dto/event/RemoveEventTag.dto';
import { SearchEventTagsDto } from '@/common/dto/event/SearchEventTags.dto';
import {
  IEventTagsManagementService,
  IEventTagsManagementService_QueryConfig,
} from '@/modules/event/app/IEventTagsManagement.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { paginate, Paginated } from 'nestjs-paginate';
import { EventTagsRepository } from '@/modules/event/infra/repository/EventTags.repository';
import { EventRepository } from '@/modules/event/infra/repository/Event.repository';
import { EventTagsEntity } from '@/modules/event/domain/EventTags.entity';
import { In } from 'typeorm';
import { TagCategoryRepositoryProvider } from '@/modules/utility/infra/repository/TagCategory.repository';

@Injectable()
export class EventTagsManagementService
  extends CoreService
  implements IEventTagsManagementService
{
  searchAllEventTags(
    dto: SearchEventTagsDto,
  ): Promise<Paginated<EventTagsResponseDto>> {
    return paginate(dto.query, EventTagsRepository(this.dataSource), {
      ...IEventTagsManagementService_QueryConfig.searchAllEventTags(),
      where: { eventId: dto.eventId },
    }).then((res) => this.mapToPaginated(EventTagsResponseDto, res));
  }

  addEventTag(dto: AddEventTagDto): Promise<EventTagsResponseDto[]> {
    return this.ensureTransaction(null, async (em) => {
      const eventRepository = EventRepository(em);
      const tagCategoryRepository = TagCategoryRepositoryProvider(em);
      const eventTagsRepository = EventTagsRepository(em);

      // validate event ownership
      const event = await eventRepository.findOneOrFail({
        where: {
          id: dto.eventId,
          createdById: dto.accountId,
        },
      });

      // validate tags
      const tagCategories = await tagCategoryRepository.find({
        where: {
          id: In(dto.tagCategoryIds),
        },
      });
      if (tagCategories.length !== dto.tagCategoryIds.length) {
        throw new BadRequestException(
          'One or more tags are invalid or not selectable',
        );
      }

      // check for existing tags (including deleted ones)
      const duplicates =
        await eventTagsRepository.findDuplicatesIncludingDeleted({
          eventId: event.id,
          tagCategoryIds: dto.tagCategoryIds,
        });

      // sort duplicates into deleted and undeleted
      const sortedDuplicates: Record<
        'deleted' | 'undeleted',
        EventTagsEntity[]
      > = duplicates.reduce(
        (acc, curr) => {
          if (curr.deletedAt) {
            acc.deleted.push(curr);
          } else {
            acc.undeleted.push(curr);
          }
          return acc;
        },
        {
          undeleted: [] as EventTagsEntity[],
          deleted: [] as EventTagsEntity[],
        },
      );

      if (sortedDuplicates.undeleted.length > 0) {
        throw new BadRequestException('One or more tags are already assigned');
      }

      if (sortedDuplicates.deleted.length > 0) {
        // restore deleted tags
        const idsToRestore = sortedDuplicates.deleted.map((d) => d.id);
        await eventTagsRepository.restore(idsToRestore);
      }

      // create new event tags
      const tagIdsToPersist = dto.tagCategoryIds.filter(
        (tagId) =>
          !sortedDuplicates.deleted.some((dup) => dup.tagCategoryId === tagId),
      );

      return await eventTagsRepository
        .persistEntities({
          tagCategoryIds: tagIdsToPersist,
          eventId: event.id,
        })
        .then((e) => this.mapToArray(EventTagsResponseDto, e));
    });
  }

  deleteEventTag(dto: RemoveEventTagDto): Promise<void> {
    return this.ensureTransaction(null, async (em) => {
      const eventRepository = EventRepository(em);
      const eventTagsRepository = EventTagsRepository(em);

      // validate event ownership
      await eventRepository.findOneOrFail({
        where: {
          id: dto.eventId,
          createdById: dto.accountId,
        },
      });

      // soft delete event tags
      await eventTagsRepository.softDelete({
        eventId: dto.eventId,
        tagCategoryId: In(dto.tagCategoryIds),
      });
    });
  }
}
