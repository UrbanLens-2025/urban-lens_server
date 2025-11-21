import { PaginateConfig, Paginated } from 'nestjs-paginate';
import { EventRequestResponseDto } from '@/common/dto/event/res/EventRequest.response.dto';
import { SearchMyEventRequestsDto } from '@/common/dto/event/SearchMyEventRequests.dto';
import { EventRequestEntity } from '@/modules/event/domain/EventRequest.entity';
import { GetMyEventRequestDto } from '@/common/dto/event/GetMyEventRequest.dto';

export const IEventRequestQueryService = Symbol('IEventRequestQueryService');

export interface IEventRequestQueryService {
  searchMyEventRequests(
    dto: SearchMyEventRequestsDto,
  ): Promise<Paginated<EventRequestResponseDto>>;

  getMyEventRequest(
    dto: GetMyEventRequestDto,
  ): Promise<EventRequestResponseDto>;
}
export namespace IEventRequestQueryService_QueryConfig {
  export function searchMyEventRequests(): PaginateConfig<EventRequestEntity> {
    return {
      sortableColumns: ['createdAt', 'updatedAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: ['eventName'],
      filterableColumns: {
        status: true,
      },
      relations: {
        tags: {
          tagCategory: true,
        },
      },
    };
  }
}
