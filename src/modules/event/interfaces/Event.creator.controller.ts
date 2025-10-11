import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ICreateEventService } from '@/modules/event/app/ICreateEvent.service';
import { CreateEventDraftDto } from '@/common/dto/event/CreateEventDraft.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AddTicketToEventDto } from '@/common/dto/event/AddTicketToEvent.dto';
import { UpdateEventTicketDto } from '@/common/dto/event/UpdateEventTicket.dto';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { IEventManagementService } from '@/modules/event/app/IEventManagement.service';
import { Paginate, type PaginateQuery } from 'nestjs-paginate';
import { WithPagination } from '@/common/WithPagination.decorator';

@ApiTags('Event - Event Creator')
@ApiBearerAuth()
@Roles(Role.EVENT_CREATOR)
@Controller('/creator/event')
export class EventCreatorController {
  constructor(
    @Inject(ICreateEventService)
    private readonly createEventService: ICreateEventService,
    @Inject(IEventManagementService)
    private readonly eventManagementService: IEventManagementService,
  ) {}

  @ApiOperation({ summary: 'Get my events (with pagination)' })
  @Get()
  @WithPagination()
  getMyEvents(
    @AuthUser() userDto: JwtTokenDto,
    @Paginate() query: PaginateQuery,
  ) {
    return this.eventManagementService.searchEvents(query, userDto.sub);
  }

  @ApiOperation({ summary: 'Get event by ID' })
  @Get('/:eventId')
  getEventById(
    @AuthUser() userDto: JwtTokenDto,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    return this.eventManagementService.findEventById(eventId, userDto.sub);
  }

  @ApiOperation({ summary: 'Get tickets in event' })
  @Get('/:eventId/tickets')
  getTicketsInEvent(
    @AuthUser() userDto: JwtTokenDto,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    return this.eventManagementService.findTicketsInEvent(eventId, userDto.sub);
  }

  @ApiOperation({ summary: 'Create Event (basic details)' })
  @Post('/draft')
  createDraftEvent(
    @AuthUser() userDto: JwtTokenDto,
    @Body() dto: CreateEventDraftDto,
  ) {
    return this.createEventService.createEventDraft(userDto.sub, dto);
  }

  @ApiOperation({ summary: 'Add ticket to event' })
  @Post('/draft/:eventId/ticket')
  addTicketToEvent(
    @AuthUser() userDto: JwtTokenDto,
    @Param('eventId', ParseUUIDPipe) id: string,
    @Body() dto: AddTicketToEventDto,
  ) {
    return this.createEventService.addTicketToEvent(userDto.sub, id, dto);
  }

  @ApiOperation({ summary: 'Update event ticket by ID' })
  @Put('/draft/:eventId/ticket/:ticketId')
  updateTicket(
    @AuthUser() userDto: JwtTokenDto,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @Body() dto: UpdateEventTicketDto,
  ) {
    return this.createEventService.updateTicket(
      userDto.sub,
      ticketId,
      eventId,
      dto,
    );
  }

  @ApiOperation({ summary: 'Delete event ticket by ID' })
  @Delete('/draft/:eventId/ticket/:ticketId')
  hardRemoveTicketFromEvent(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @AuthUser() userDto: JwtTokenDto,
  ) {
    return this.createEventService.hardRemoveTicketFromEvent({
      eventId,
      ticketId,
      accountId: userDto.sub,
    });
  }
}
