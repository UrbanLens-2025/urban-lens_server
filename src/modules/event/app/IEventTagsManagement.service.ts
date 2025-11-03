import { PaginateConfig, Paginated } from 'nestjs-paginate';
import { EventTagsResponseDto } from '@/common/dto/event/res/EventTags.response.dto';
import { AddEventTagDto } from '@/common/dto/event/AddEventTag.dto';
import { RemoveEventTagDto } from '@/common/dto/event/RemoveEventTag.dto';
import { SearchEventTagsDto } from '@/common/dto/event/SearchEventTags.dto';
import { EventTagsEntity } from '@/modules/event/domain/EventTags.entity';

export const IEventTagsManagementService = Symbol(
  'IEventTagsManagementService',
);

export interface IEventTagsManagementService {
  searchAllEventTags(
    dto: SearchEventTagsDto,
  ): Promise<Paginated<EventTagsResponseDto>>;

  addEventTag(dto: AddEventTagDto): Promise<EventTagsResponseDto[]>;

  deleteEventTag(dto: RemoveEventTagDto): Promise<void>;
}

export namespace IEventTagsManagementService_QueryConfig {
  export function searchAllEventTags(): PaginateConfig<EventTagsEntity> {
    return {
      sortableColumns: ['createdAt', 'updatedAt', 'id', 'eventId', 'tagId'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: [],
      filterableColumns: {
        eventId: true,
        tagId: true,
      },
      relations: {
        event: true,
        tag: true,
      },
    };
  }
}
