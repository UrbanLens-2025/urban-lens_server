import { CoreService } from '@/common/core/Core.service';
import {
  IEventAttendanceQueryService,
  IEventAttendanceQueryService_QueryConfig,
} from '@/modules/event/app/IEventAttendanceQuery.service';
import { Injectable } from '@nestjs/common';
import { EventAttendanceResponseDto } from '@/common/dto/event/res/EventAttendance.response.dto';
import { SearchEventAttendanceDto } from '@/common/dto/event/SearchEventAttendance.dto';
import { paginate, Paginated } from 'nestjs-paginate';
import { EventAttendanceRepository } from '@/modules/event/infra/repository/EventAttendance.repository';
import { SearchMyEventAttendanceDto } from '@/common/dto/event/SearchMyEventAttendance.dto';
import { RefundTicketDto } from '@/common/dto/event/RefundTicket.dto';

@Injectable()
export class EventAttendanceQueryService
  extends CoreService
  implements IEventAttendanceQueryService
{
  searchMyEventAttendance(
    dto: SearchMyEventAttendanceDto,
  ): Promise<Paginated<EventAttendanceResponseDto>> {
    return paginate(dto.query, EventAttendanceRepository(this.dataSource), {
      ...IEventAttendanceQueryService_QueryConfig.searchMyEventAttendance(),
      where: {
        ownerId: dto.accountId,
      },
    }).then((res) => this.mapToPaginated(EventAttendanceResponseDto, res));
  }

  searchAllEventAttendance(
    dto: SearchEventAttendanceDto,
  ): Promise<Paginated<EventAttendanceResponseDto>> {
    return paginate(dto.query, EventAttendanceRepository(this.dataSource), {
      ...IEventAttendanceQueryService_QueryConfig.searchAllEventAttendance(),
      where: {
        eventId: dto.eventId,
        event: {
          createdById: dto.accountId,
        },
      },
    }).then((res) => this.mapToPaginated(EventAttendanceResponseDto, res));
  }
}
