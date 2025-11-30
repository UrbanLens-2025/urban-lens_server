import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Ip,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  IEventQueryService,
  IEventQueryService_QueryConfig,
} from '@/modules/event/app/IEventQuery.service';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';
import { IEventManagementService } from '@/modules/event/app/IEventManagement.service';
import { UpdateEventDto } from '@/common/dto/event/UpdateEvent.dto';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { IEventTagsManagementService } from '@/modules/event/app/IEventTagsManagement.service';
import { AddEventTagDto } from '@/common/dto/event/AddEventTag.dto';
import { RemoveEventTagDto } from '@/common/dto/event/RemoveEventTag.dto';
import { IEventTicketManagementService } from '@/modules/event/app/IEventTicketManagement.service';
import { AddTicketToEventDto } from '@/common/dto/event/AddTicketToEvent.dto';
import { UpdateEventTicketDto } from '@/common/dto/event/UpdateEventTicket.dto';
import {
  IEventAttendanceQueryService,
  IEventAttendanceQueryService_QueryConfig,
} from '@/modules/event/app/IEventAttendanceQuery.service';
import {
  ITicketOrderQueryService,
  ITicketOrderQueryService_QueryConfig,
} from '@/modules/event/app/ITicketOrderQuery.service';
import { IEventAttendanceManagementService } from '@/modules/event/app/IEventAttendanceManagement.service';
import { ConfirmTicketUsageDto } from '@/common/dto/event/ConfirmTicketUsage.dto';
import { CreateEventDto } from '@/common/dto/event/CreateEvent.dto';
import { EventResponseDto } from '@/common/dto/event/res/Event.response.dto';
import { AddLocationBookingDto } from '@/common/dto/event/AddLocationBooking.dto';
import { CancelEventBookingDto } from '@/common/dto/event/CancelEventBooking.dto';
import { GetLocationBookingsByEventDto } from '@/common/dto/event/GetLocationBookingsByEvent.dto';
import { LocationBookingResponseDto } from '@/common/dto/location-booking/res/LocationBooking.response.dto';
import { CancelEventDto } from '@/common/dto/event/CancelEvent.dto';

@ApiBearerAuth()
@ApiTags('Event')
@Roles(Role.EVENT_CREATOR)
@Controller('/creator/events')
export class EventCreatorController {
  constructor(
    @Inject(IEventQueryService)
    private readonly eventQueryService: IEventQueryService,
    @Inject(IEventManagementService)
    private readonly eventManagementService: IEventManagementService,
    @Inject(IEventTagsManagementService)
    private readonly eventTagsManagementService: IEventTagsManagementService,
    @Inject(IEventTicketManagementService)
    private readonly eventTicketManagementService: IEventTicketManagementService,
    @Inject(IEventAttendanceQueryService)
    private readonly eventAttendanceQueryService: IEventAttendanceQueryService,
    @Inject(ITicketOrderQueryService)
    private readonly ticketOrderQueryService: ITicketOrderQueryService,
    @Inject(IEventAttendanceManagementService)
    private readonly eventAttendanceManagementService: IEventAttendanceManagementService,
  ) {}

  @ApiOperation({ summary: 'Create a new event' })
  @Post()
  createEvent(
    @AuthUser() userDto: JwtTokenDto,
    @Body() dto: CreateEventDto,
  ): Promise<EventResponseDto> {
    return this.eventManagementService.createEvent({
      ...dto,
      accountId: userDto.sub,
    });
  }

  @ApiOperation({ summary: 'Cancel my event' })
  @Delete('/:eventId/cancel')
  cancelMyEvent(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @AuthUser() userDto: JwtTokenDto,
    @Body() dto: CancelEventDto,
  ) {
    return this.eventManagementService.cancelEvent({
      ...dto,
      eventId,
      accountId: userDto.sub,
    });
  }

  @ApiOperation({ summary: 'Add a location booking to my event' })
  @Post('/:eventId/location-bookings')
  addLocationBookingToMyEvent(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @AuthUser() userDto: JwtTokenDto,
    @Body() dto: AddLocationBookingDto,
  ) {
    return this.eventManagementService.addLocationBooking({
      ...dto,
      eventId,
      accountId: userDto.sub,
    });
  }

  @ApiOperation({ summary: 'Initiate payment for location booking' })
  @Post('/:eventId/location-bookings/:locationBookingId/payment')
  initiatePaymentForLocationBooking(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('locationBookingId', ParseUUIDPipe) locationBookingId: string,
    @AuthUser() userDto: JwtTokenDto,
    @Ip() ipAddress: string,
  ) {
    return this.eventManagementService.initiateBookingPayment({
      eventId,
      locationBookingId,
      accountId: userDto.sub,
      accountName: userDto.email,
      ipAddress,
      returnUrl: '',
    });
  }

  @ApiOperation({ summary: 'Cancel a location booking for my event' })
  @Delete('/:eventId/location-bookings/:locationBookingId/cancel')
  cancelLocationBooking(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('locationBookingId', ParseUUIDPipe) locationBookingId: string,
    @AuthUser() userDto: JwtTokenDto,
    @Body() dto: CancelEventBookingDto,
  ) {
    return this.eventManagementService.cancelEventBooking({
      ...dto,
      eventId,
      locationBookingId,
      accountId: userDto.sub,
    });
  }

  @ApiOperation({ summary: 'Get location bookings for my event' })
  @Get('/:eventId/location-bookings')
  getLocationBookingsForMyEvent(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @AuthUser() userDto: JwtTokenDto,
  ): Promise<LocationBookingResponseDto[]> {
    const dto: GetLocationBookingsByEventDto = {
      eventId,
    };

    return this.eventQueryService.getLocationBookingsByEvent(dto);
  }

  @ApiOperation({ summary: 'Get all my events' })
  @ApiPaginationQuery(IEventQueryService_QueryConfig.searchMyEvents())
  @Get()
  getMyEvents(
    @AuthUser() userDto: JwtTokenDto,
    @Paginate() query: PaginateQuery,
  ) {
    return this.eventQueryService.searchMyEvents({
      accountId: userDto.sub,
      query,
    });
  }

  @ApiOperation({ summary: 'Get my event by ID' })
  @Get('/:eventId')
  getMyEventById(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @AuthUser() userDto: JwtTokenDto,
  ) {
    return this.eventQueryService.getMyEventById({
      eventId,
      accountId: userDto.sub,
    });
  }

  @ApiOperation({ summary: 'Update my event details' })
  @Put('/:eventId')
  updateMyEventById(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @AuthUser() userDto: JwtTokenDto,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventManagementService.updateMyEvent({
      ...dto,
      eventId,
      accountId: userDto.sub,
    });
  }

  @ApiOperation({ summary: 'Add tags to my event' })
  @Post('/:eventId/tags')
  addTagsToMyEvent(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @AuthUser() userDto: JwtTokenDto,
    @Body() dto: AddEventTagDto,
  ) {
    return this.eventTagsManagementService.addEventTag({
      ...dto,
      eventId,
      accountId: userDto.sub,
    });
  }

  @ApiOperation({ summary: 'Remove tags from my event' })
  @Delete('/:eventId/tags')
  removeTagsFromMyEvent(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @AuthUser() userDto: JwtTokenDto,
    @Body() dto: RemoveEventTagDto,
  ) {
    return this.eventTagsManagementService.deleteEventTag({
      ...dto,
      eventId,
      accountId: userDto.sub,
    });
  }

  @ApiOperation({ summary: 'Search all event attendance' })
  @ApiPaginationQuery(
    IEventAttendanceQueryService_QueryConfig.searchAllEventAttendance(),
  )
  @Get('/attendance/:eventId')
  searchAllEventAttendance(
    @Paginate() query: PaginateQuery,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @AuthUser() userDto: JwtTokenDto,
  ) {
    return this.eventAttendanceQueryService.searchAllEventAttendance({
      query,
      eventId,
      accountId: userDto.sub,
    });
  }

  @ApiOperation({ summary: 'Get all tickets for my event' })
  @Get('/:eventId/tickets')
  getAllTicketsForMyEvent(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @AuthUser() userDto: JwtTokenDto,
  ) {
    return this.eventQueryService.getAllEventTickets({
      eventId,
      accountId: userDto.sub,
    });
  }

  @ApiOperation({ summary: 'Create a ticket for my event' })
  @Post('/:eventId/tickets')
  createTicketForMyEvent(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @AuthUser() userDto: JwtTokenDto,
    @Body() dto: AddTicketToEventDto,
  ) {
    return this.eventTicketManagementService.createEventTicket({
      ...dto,
      eventId,
      accountId: userDto.sub,
    });
  }

  @ApiOperation({ summary: 'Update a ticket for my event' })
  @Put('/:eventId/tickets/:ticketId')
  updateTicketForMyEvent(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @AuthUser() userDto: JwtTokenDto,
    @Body() dto: UpdateEventTicketDto,
  ) {
    return this.eventTicketManagementService.updateEventTicket({
      ...dto,
      ticketId,
      accountId: userDto.sub,
    });
  }

  @ApiOperation({ summary: 'Delete a ticket from my event' })
  @Delete('/:eventId/tickets/:ticketId')
  deleteTicketForMyEvent(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @AuthUser() userDto: JwtTokenDto,
  ) {
    return this.eventTicketManagementService.deleteEventTicket({
      ticketId,
      accountId: userDto.sub,
    });
  }

  @ApiOperation({ summary: 'Publish my event' })
  @Post('/:eventId/publish')
  publishMyEvent(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @AuthUser() userDto: JwtTokenDto,
  ) {
    return this.eventManagementService.publishEvent({
      eventId,
      accountId: userDto.sub,
    });
  }

  @ApiOperation({ summary: 'Get order details in my event by ID' })
  @Get('/:eventId/orders/:orderId')
  getOrderInEventById(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @AuthUser() userDto: JwtTokenDto,
  ) {
    return this.ticketOrderQueryService.getOrderInEventById({
      eventId,
      orderId,
      accountId: userDto.sub,
    });
  }

  @ApiOperation({ summary: 'Get all orders in my event' })
  @ApiPaginationQuery(ITicketOrderQueryService_QueryConfig.getOrdersInEvent())
  @Get('/:eventId/orders')
  getOrdersInEvent(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @AuthUser() userDto: JwtTokenDto,
    @Paginate() query: PaginateQuery,
  ) {
    return this.ticketOrderQueryService.getOrdersInEvent({
      eventId,
      accountId: userDto.sub,
      query,
    });
  }

  @ApiOperation({ summary: 'Confirm ticket usage' })
  @Post('/:eventId/attendance/confirm-usage')
  confirmTicketUsage(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @AuthUser() userDto: JwtTokenDto,
    @Body() dto: ConfirmTicketUsageDto,
  ) {
    return this.eventAttendanceManagementService.confirmTicketUsage({
      ...dto,
      accountId: userDto.sub,
      eventId: eventId,
    });
  }

  @ApiOperation({ summary: 'Finish my event' })
  @Post('/:eventId/finish')
  finishMyEvent(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @AuthUser() userDto: JwtTokenDto,
  ) {
    return this.eventManagementService.finishEvent({
      eventId,
      accountId: userDto.sub,
    });
  }
}
