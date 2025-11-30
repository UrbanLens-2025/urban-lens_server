import {
  Body,
  Controller,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IEventAnalyticsService } from '@/modules/event/app/IEventAnalytics.service';
import { GetTotalTicketsSoldDto } from '@/common/dto/event/GetTotalTicketsSold.dto';
import { TotalTicketsSoldResponseDto } from '@/common/dto/event/analytics/TotalTicketsSold.response.dto';
import { GetTotalRevenueDto } from '@/common/dto/event/GetTotalRevenue.dto';
import { TotalRevenueResponseDto } from '@/common/dto/event/analytics/TotalRevenue.response.dto';
import { GetSalesVelocityDto } from '@/common/dto/event/GetSalesVelocity.dto';
import { SalesVelocityResponseDto } from '@/common/dto/event/analytics/SalesVelocity.response.dto';
import { GetTicketsWithRevenueDto } from '@/common/dto/event/GetTicketsWithRevenue.dto';
import { TicketsWithRevenueResponseDto } from '@/common/dto/event/analytics/TicketsWithRevenue.response.dto';

@ApiTags('Event Analytics (Dev Only)')
@Controller('/dev-only/analytics/event')
export class EventAnalyticsDevOnlyController {
  constructor(
    @Inject(IEventAnalyticsService)
    private readonly eventAnalyticsService: IEventAnalyticsService,
  ) {}

  @ApiOperation({ summary: 'Get total tickets sold for an event (dev-only)' })
  @Post('/:eventId/total-tickets-sold')
  getTotalTicketsSold(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() body: Pick<GetTotalTicketsSoldDto, 'betweenDates'>,
  ): Promise<TotalTicketsSoldResponseDto> {
    const dto = new GetTotalTicketsSoldDto();
    dto.eventId = eventId;
    dto.betweenDates = body.betweenDates;
    return this.eventAnalyticsService.getTotalTicketsSold(dto);
  }

  @ApiOperation({ summary: 'Get total revenue for an event (dev-only)' })
  @Post('/:eventId/total-revenue')
  getTotalRevenue(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() body: Pick<GetTotalRevenueDto, 'betweenDates'>,
  ): Promise<TotalRevenueResponseDto> {
    const dto = new GetTotalRevenueDto();
    dto.eventId = eventId;
    dto.betweenDates = body.betweenDates;
    return this.eventAnalyticsService.getTotalRevenue(dto);
  }

  @ApiOperation({ summary: 'Get sales velocity for an event (dev-only)' })
  @Post('/:eventId/sales-velocity')
  getSalesVelocity(
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ): Promise<SalesVelocityResponseDto> {
    const dto = new GetSalesVelocityDto();
    dto.eventId = eventId;
    return this.eventAnalyticsService.getSalesVelocity(dto);
  }

  @ApiOperation({ summary: 'Get tickets with revenue for an event (dev-only)' })
  @Post('/:eventId/tickets-with-revenue')
  getTicketsWithRevenue(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() body: Pick<GetTicketsWithRevenueDto, 'betweenDates'>,
  ): Promise<TicketsWithRevenueResponseDto> {
    const dto = new GetTicketsWithRevenueDto();
    dto.eventId = eventId;
    dto.betweenDates = body.betweenDates;
    return this.eventAnalyticsService.getTicketsWithRevenue(dto);
  }
}
