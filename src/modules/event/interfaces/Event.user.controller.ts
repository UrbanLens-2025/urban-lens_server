import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { ITicketOrderManagementService } from '@/modules/event/app/ITicketOrderManagement.service';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { CreateTicketOrderDto } from '@/common/dto/event/CreateTicketOrder.dto';

@ApiTags('Event')
@ApiBearerAuth()
@Roles(Role.USER)
@Controller('/user/event')
export class EventUserController {
  constructor(
    @Inject(ITicketOrderManagementService)
    private readonly ticketOrderManagementService: ITicketOrderManagementService,
  ) {}

  @Post('/:eventId/create-order')
  createOrder(
    @AuthUser() userDto: JwtTokenDto,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: CreateTicketOrderDto,
  ) {
    return this.ticketOrderManagementService.createOrder({
      ...dto,
      eventId,
      accountId: userDto.sub,
    });
  }
}
