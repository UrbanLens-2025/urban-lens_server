import { AuthUser } from '@/common/AuthUser.decorator';
import { Role } from '@/common/constants/Role.constant';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { CreateFineForBookingDto } from '@/common/dto/location-booking/CreateFineForBooking.dto';
import { UpdateFineDto } from '@/common/dto/location-booking/UpdateFine.dto';
import { Roles } from '@/common/Roles.decorator';
import { ILocationBookingFineService } from '@/modules/location-booking/app/ILocationBookingFine.service';
import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Location Booking Fine')
@Roles(Role.ADMIN)
@ApiBearerAuth()
@Controller('/admin/location-booking-fines')
export class LocationBookingFineAdminController {
  constructor(
    @Inject(ILocationBookingFineService)
    private readonly locationBookingFineService: ILocationBookingFineService,
  ) {}

  @ApiOperation({ summary: 'Create a new fine for a booking' })
  @Post()
  createFineForBooking(
    @AuthUser() user: JwtTokenDto,
    @Body() dto: CreateFineForBookingDto,
  ) {
    return this.locationBookingFineService.createFineForBooking({
      ...dto,
      createdById: user.sub,
    });
  }

  @ApiOperation({ summary: 'Update a fine for a booking' })
  @Put(':id')
  updateFine(
    @AuthUser() user: JwtTokenDto,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFineDto,
  ) {
    return this.locationBookingFineService.updateFine({
      ...dto,
      fineId: id,
      updateById: user.sub,
    });
  }

  @ApiOperation({ summary: 'Get all fines for a booking' })
  @Get(':id')
  getFinesByBookingId(@Param('id', ParseUUIDPipe) id: string) {
    return this.locationBookingFineService.getFinesByBookingId({
      bookingId: id,
    });
  }
}
