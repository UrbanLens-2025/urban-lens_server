import { EventAttendanceStatus } from '@/common/constants/EventAttendanceStatus.constant';
import { CoreService } from '@/common/core/Core.service';
import { ConfirmTicketUsageDto } from '@/common/dto/event/ConfirmTicketUsage.dto';
import { EventAttendanceResponseDto } from '@/common/dto/event/res/EventAttendance.response.dto';
import { AccountRepositoryProvider } from '@/modules/account/infra/repository/Account.repository';
import { IEventAttendanceManagementService } from '@/modules/event/app/IEventAttendanceManagement.service';
import { EventRepository } from '@/modules/event/infra/repository/Event.repository';
import { EventAttendanceRepository } from '@/modules/event/infra/repository/EventAttendance.repository';
import { EventTicketRepository } from '@/modules/event/infra/repository/EventTicket.repository';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateResult } from 'typeorm';

@Injectable()
export class EventAttendanceManagementService
  extends CoreService
  implements IEventAttendanceManagementService
{
  confirmTicketUsage(
    dto: ConfirmTicketUsageDto,
  ): Promise<EventAttendanceResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const eventAttendanceRepository = EventAttendanceRepository(em);
      const eventRepository = EventRepository(em);

      const event = await eventRepository.findOneOrFail({
        where: { id: dto.eventId, createdById: dto.accountId },
      });

      const eventAttendance = await eventAttendanceRepository.findOneOrFail({
        where: { id: dto.eventAttendanceId, ownerId: dto.checkingInAccountId },
      });

      if (!event.canCheckIn()) {
        throw new BadRequestException('Event cannot be checked in');
      }

      if (!eventAttendance.canCheckIn()) {
        throw new BadRequestException('Event attendance cannot be checked in');
      }

      eventAttendance.status = EventAttendanceStatus.CHECKED_IN;

      return eventAttendanceRepository
        .save(eventAttendance)
        .then((savedEventAttendance) =>
          this.mapTo(EventAttendanceResponseDto, savedEventAttendance),
        );
    });
  }
}
