import { Role } from '@/common/constants/Role.constant';
import { Roles } from '@/common/Roles.decorator';
import { ILocationBookingFineService } from '@/modules/location-booking/app/ILocationBookingFine.service';
import { Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Location Booking Fine')
@Roles(Role.BUSINESS_OWNER)
@ApiBearerAuth()
@Controller('/owner/location-booking-fines')
export class LocationBookingFineOwnerController {
  constructor(
    @Inject(ILocationBookingFineService)
    private readonly locationBookingFineService: ILocationBookingFineService,
  ) {}

  @Get(':bookingId')
  getFinesByBookingId(@Param('bookingId', ParseUUIDPipe) bookingId: string) {
    return this.locationBookingFineService.getFinesByBookingId({
      bookingId,
    });
  }
}
