import { PaginateConfig, Paginated } from 'nestjs-paginate';
import { EventAttendanceEntity } from '@/modules/event/domain/EventAttendance.entity';
import { EventAttendanceResponseDto } from '@/common/dto/event/res/EventAttendance.response.dto';
import { SearchEventAttendanceDto } from '@/common/dto/event/SearchEventAttendance.dto';
import { SearchMyEventAttendanceDto } from '@/common/dto/event/SearchMyEventAttendance.dto';

export const IEventAttendanceQueryService = Symbol(
  'IEventAttendanceQueryService',
);

export interface IEventAttendanceQueryService {
  searchAllEventAttendance(
    dto: SearchEventAttendanceDto,
  ): Promise<Paginated<EventAttendanceResponseDto>>;

  searchMyEventAttendance(
    dto: SearchMyEventAttendanceDto,
  ): Promise<Paginated<EventAttendanceResponseDto>>;
}

export namespace IEventAttendanceQueryService_QueryConfig {
  export function searchMyEventAttendance(): PaginateConfig<EventAttendanceEntity> {
    return {
      sortableColumns: ['createdAt', 'updatedAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      filterableColumns: {
        status: true,
      },
      relations: {
        ticket: true,
        event: true,
      },
    };
  }

  export function searchAllEventAttendance(): PaginateConfig<EventAttendanceEntity> {
    return {
      sortableColumns: ['createdAt', 'updatedAt', 'checkedInAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: [],
      filterableColumns: {
        status: true,
        orderId: true,
      },
      relations: {
        order: {
          createdBy: true,
          orderDetails: {
            ticket: true,
          },
        },
      },
    };
  }
}
