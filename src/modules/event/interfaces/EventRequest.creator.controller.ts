import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { CreateEventRequestWithBusinessLocationDto } from '@/common/dto/event/CreateEventRequestWithBusinessLocation.dto';
import { IEventRequestManagementService } from '@/modules/event/app/IEventRequestManagement.service';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';
import {
  IEventRequestQueryService,
  IEventRequestQueryService_QueryConfig,
} from '@/modules/event/app/IEventRequestQuery.service';

@ApiTags('Event Request')
@ApiBearerAuth()
@Roles(Role.EVENT_CREATOR)
@Controller('/creator/event-request')
export class EventRequestCreatorController {
  constructor(
    @Inject(IEventRequestManagementService)
    private readonly eventRequestManagementService: IEventRequestManagementService,
    @Inject(IEventRequestQueryService)
    private readonly eventRequestQueryService: IEventRequestQueryService,
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

  @ApiOperation({ summary: 'Search my created event requests' })
  @ApiPaginationQuery(
    IEventRequestQueryService_QueryConfig.searchMyEventRequests(),
  )
  @Get('/search')
  searchMyEventRequests(
    @AuthUser() user: JwtTokenDto,
    @Paginate() query: PaginateQuery,
  ) {
    return this.eventRequestQueryService.searchMyEventRequests({
      accountId: user.sub,
      query,
    });
  }

  @ApiOperation({ summary: 'Get my created event request by ID' })
  @Get('/search/:id')
  getMyEventRequestById(
    @AuthUser() user: JwtTokenDto,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.eventRequestQueryService.getMyEventRequest({
      accountId: user.sub,
      eventRequestId: id,
    });
  }
}
