import { CoreService } from '@/common/core/Core.service';
import { GetTotalTicketsSoldDto } from '@/common/dto/event/GetTotalTicketsSold.dto';
import { TotalTicketsSoldResponseDto } from '@/common/dto/event/analytics/TotalTicketsSold.response.dto';
import { GetTotalRevenueDto } from '@/common/dto/event/GetTotalRevenue.dto';
import { TotalRevenueResponseDto } from '@/common/dto/event/analytics/TotalRevenue.response.dto';
import { GetSalesVelocityDto } from '@/common/dto/event/GetSalesVelocity.dto';
import { SalesVelocityResponseDto } from '@/common/dto/event/analytics/SalesVelocity.response.dto';
import { GetTicketsWithRevenueDto } from '@/common/dto/event/GetTicketsWithRevenue.dto';
import { IEventAnalyticsService } from '@/modules/event/app/IEventAnalytics.service';
import { Injectable } from '@nestjs/common';
import { EventRepository } from '@/modules/event/infra/repository/Event.repository';
import { TicketOrderRepository } from '@/modules/event/infra/repository/TicketOrder.repository';
import { TicketsWithRevenueResponseDto } from '@/common/dto/event/analytics/TicketsWithRevenue.response.dto';
import { GetTotalAttendeesDto } from '@/common/dto/event/GetTotalAttendees.dto';
import dayjs from 'dayjs';

@Injectable()
export class EventAnalyticsService
  extends CoreService
  implements IEventAnalyticsService
{
  getTotalTicketsSold(
    dto: GetTotalTicketsSoldDto,
  ): Promise<TotalTicketsSoldResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const eventRepository = EventRepository(em);
      const ticketOrderRepository = TicketOrderRepository(em);

      await eventRepository.findOneByOrFail({
        id: dto.eventId,
      });

      const totalTicketsSold = await ticketOrderRepository.getTotalTicketsSold({
        eventId: dto.eventId,
        startDate: dto.startDate,
        endDate: dto.endDate,
      });

      return this.mapTo(TotalTicketsSoldResponseDto, { totalTicketsSold });
    });
  }

  getTotalRevenue(dto: GetTotalRevenueDto): Promise<TotalRevenueResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const eventRepository = EventRepository(em);
      const ticketOrderRepository = TicketOrderRepository(em);

      await eventRepository.findOneByOrFail({
        id: dto.eventId,
      });

      const totalRevenue = await ticketOrderRepository.getTotalRevenue({
        eventId: dto.eventId,
        startDate: dto.startDate,
        endDate: dto.endDate,
      });

      return this.mapTo(TotalRevenueResponseDto, { totalRevenue });
    });
  }

  getSalesVelocity(
    dto: GetSalesVelocityDto,
  ): Promise<SalesVelocityResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const eventRepository = EventRepository(em);
      const ticketOrderRepository = TicketOrderRepository(em);

      const event = await eventRepository.findOneByOrFail({
        id: dto.eventId,
      });

      const startDate = event.startDate ?? event.createdAt;
      const endDate = event.endDate ?? new Date();

      const totalTicketsSold = await ticketOrderRepository.getTotalTicketsSold({
        eventId: dto.eventId,
        startDate,
        endDate,
      });

      const diffInDays = dayjs(endDate).diff(dayjs(startDate), 'day', true);
      const days = Math.max(1, diffInDays);
      const salesVelocity = totalTicketsSold / days;

      return this.mapTo(SalesVelocityResponseDto, { salesVelocity });
    });
  }

  getTicketsWithRevenue(
    dto: GetTicketsWithRevenueDto,
  ): Promise<TicketsWithRevenueResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const eventRepo = EventRepository(em);
      const ticketOrderRepo = TicketOrderRepository(em);

      await eventRepo.findOneOrFail({
        where: {
          id: dto.eventId,
        },
      });

      const ticketsWithRevenue = await ticketOrderRepo.getTicketsWithRevenue({
        eventId: dto.eventId,
        startDate: dto.startDate,
        endDate: dto.endDate,
      });

      return this.mapTo(TicketsWithRevenueResponseDto, {
        tickets: ticketsWithRevenue,
      });
    });
  }

  getTotalAttendees(dto: GetTotalAttendeesDto): Promise<unknown> {
    return this.ensureTransaction(null, async (em) => {
      // TODO: implement getTotalAttendees
      return null;
    });
  }
}
