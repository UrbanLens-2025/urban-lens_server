import { CoreService } from '@/common/core/Core.service';
import { EventRequestResponseDto } from '@/common/dto/event/res/EventRequest.response.dto';
import { SearchMyEventRequestsDto } from '@/common/dto/event/SearchMyEventRequests.dto';
import {
  IEventRequestQueryService,
  IEventRequestQueryService_QueryConfig,
} from '@/modules/event/app/IEventRequestQuery.service';
import { Injectable } from '@nestjs/common';
import { paginate, Paginated } from 'nestjs-paginate';
import { EventRequestRepository } from '@/modules/event/infra/repository/EventRequest.repository';
import { GetMyEventRequestDto } from '@/common/dto/event/GetMyEventRequest.dto';

@Injectable()
export class EventRequestQueryService
  extends CoreService
  implements IEventRequestQueryService
{
  searchMyEventRequests(
    dto: SearchMyEventRequestsDto,
  ): Promise<Paginated<EventRequestResponseDto>> {
    return paginate(dto.query, EventRequestRepository(this.dataSource), {
      ...IEventRequestQueryService_QueryConfig.searchMyEventRequests(),
      where: {
        createdById: dto.accountId,
      },
    }).then((res) => this.mapToPaginated(EventRequestResponseDto, res));
  }

  getMyEventRequest(
    dto: GetMyEventRequestDto,
  ): Promise<EventRequestResponseDto> {
    const eventRequestRepository = EventRequestRepository(this.dataSource);
    return eventRequestRepository
      .findOneOrFail({
        where: {
          id: dto.eventRequestId,
          createdById: dto.accountId,
        },
        relations: {
          referencedLocationBooking: {
            location: true,
          },
          tags: {
            tagCategory: true,
          },
          createdBy: true,
        },
      })
      .then((entity) => this.mapTo(EventRequestResponseDto, entity));
  }
}
