import { Role } from '@/common/constants/Role.constant';
import { Roles } from '@/common/Roles.decorator';
import { IEventQueryService } from '@/modules/event/app/IEventQuery.service';
import { Controller, Get, Inject, ParseUUIDPipe, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Event')
@Roles(Role.BUSINESS_OWNER)
@ApiBearerAuth()
@Controller('/owner/events')
export class EventOwnerController {
  constructor(
    @Inject(IEventQueryService)
    private readonly eventQueryService: IEventQueryService,
  ) {}

  @Get('/get-by-id/:eventId')
  getEventById(@Param('eventId', ParseUUIDPipe) eventId: string) {
    // todo: fix this to only fetch events that are organized at a location owned by the business owner
    return this.eventQueryService.getAnyEventById({ eventId });
  }
}
