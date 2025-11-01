import { Body, Controller, Inject, Post } from '@nestjs/common';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { CreateEventRequestWithBusinessLocationDto } from '@/common/dto/event/CreateEventRequestWithBusinessLocation.dto';
import { IEventRequestManagementService } from '@/modules/event/app/IEventRequestManagement.service';

@ApiTags('Event Request')
@ApiBearerAuth()
@Roles(Role.EVENT_CREATOR)
@Controller('/creator/event-request')
export class EventRequestCreatorController {
  constructor(
    @Inject(IEventRequestManagementService)
    private readonly eventRequestManagementService: IEventRequestManagementService,
  ) {}

  @ApiOperation({ summary: 'Create event request with business location' })
  @Post('/with-business-location')
  createEventRequestWithBusinessLocation(
    @AuthUser() user: JwtTokenDto,
    @Body() dto: CreateEventRequestWithBusinessLocationDto,
  ) {
    return this.eventRequestManagementService.createEventRequest_WithBusinessLocation(
      {
        ...dto,
        accountId: user.sub,
      },
    );
  }
}
