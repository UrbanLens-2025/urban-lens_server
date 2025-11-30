import { GetTotalTicketsSoldDto } from '@/common/dto/event/GetTotalTicketsSold.dto';
import { TotalTicketsSoldResponseDto } from '@/common/dto/event/analytics/TotalTicketsSold.response.dto';
import { GetTotalRevenueDto } from '@/common/dto/event/GetTotalRevenue.dto';
import { TotalRevenueResponseDto } from '@/common/dto/event/analytics/TotalRevenue.response.dto';
import { GetSalesVelocityDto } from '@/common/dto/event/GetSalesVelocity.dto';
import { SalesVelocityResponseDto } from '@/common/dto/event/analytics/SalesVelocity.response.dto';
import { GetTicketsWithRevenueDto } from '@/common/dto/event/GetTicketsWithRevenue.dto';
import { TicketsWithRevenueResponseDto } from '@/common/dto/event/analytics/TicketsWithRevenue.response.dto';
import { GetTotalAttendeesDto } from '@/common/dto/event/GetTotalAttendees.dto';

export const IEventAnalyticsService = Symbol('IEventAnalyticsService');
export interface IEventAnalyticsService {
  getTotalTicketsSold(
    dto: GetTotalTicketsSoldDto,
  ): Promise<TotalTicketsSoldResponseDto>;
  getTotalRevenue(dto: GetTotalRevenueDto): Promise<TotalRevenueResponseDto>;
  getSalesVelocity(dto: GetSalesVelocityDto): Promise<SalesVelocityResponseDto>;
  getTicketsWithRevenue(
    dto: GetTicketsWithRevenueDto,
  ): Promise<TicketsWithRevenueResponseDto>;
  getTotalAttendees(dto: GetTotalAttendeesDto): Promise<unknown>;
}
