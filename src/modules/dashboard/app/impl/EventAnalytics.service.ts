import { EventAttendanceStatus } from '@/common/constants/EventAttendanceStatus.constant';
import { CoreService } from '@/common/core/Core.service';
import { GetGeneralEventAnalyticsResponseDto } from '@/common/dto/event/analytics/GetGeneralEventAnalytics.response.dto';
import { IEventAnalyticsService } from '@/modules/dashboard/app/IEventAnalytics.service';
import { EventEntity } from '@/modules/event/domain/Event.entity';
import { EventRepository } from '@/modules/event/infra/repository/Event.repository';
import { EventAttendanceRepository } from '@/modules/event/infra/repository/EventAttendance.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EventAnalyticsService
  extends CoreService
  implements IEventAnalyticsService
{
  async getGeneralEventAnalytics(
    eventId: string,
  ): Promise<GetGeneralEventAnalyticsResponseDto> {
    const eventRepo = EventRepository(this.dataSource);

    const event = await eventRepo.findOneOrFail({
      where: {
        id: eventId,
      },
      relations: {
        ticketOrders: true,
        tickets: true,
      },
    });
    const eventAttendanceRepo = EventAttendanceRepository(this.dataSource);

    const totalRevenue = EventEntity.calculateAmountToReceive(
      event.ticketOrders,
      event.systemCutPercentage,
      event.id,
    );

    const totalRevenueBeforeTax = event.ticketOrders.reduce((acc, order) => {
      return (
        acc +
        Number(order.totalPaymentAmount - Number(order.refundedAmount ?? 0))
      );
    }, 0);

    const totalPaidOrders = event.ticketOrders.length;

    const ticketsSold = event.tickets.reduce((acc, ticket) => {
      return acc + ticket.quantityReserved;
    }, 0);

    const totalTickets = event.tickets.reduce((acc, ticket) => {
      return acc + ticket.totalQuantity;
    }, 0);

    const eventAttendances = await eventAttendanceRepo.find({
      where: {
        eventId: event.id,
      },
    });

    const totalCheckedInAttendees = eventAttendances.filter(
      (attendance) => attendance.status === EventAttendanceStatus.CHECKED_IN,
    ).length;

    const totalAttendees = eventAttendances.filter(
      (attendance) =>
        attendance.status === EventAttendanceStatus.CREATED ||
        attendance.status === EventAttendanceStatus.CHECKED_IN,
    ).length;

    const ticketTypes = event.tickets.length;

    return this.mapTo(GetGeneralEventAnalyticsResponseDto, {
      totalRevenue,
      totalRevenueBeforeTax,
      totalPaidOrders,
      ticketsSold,
      totalTickets,
      totalCheckedInAttendees,
      totalAttendees,
      ticketTypes,
    });
  }
}
