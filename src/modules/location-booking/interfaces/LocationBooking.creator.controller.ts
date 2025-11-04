import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { ILocationBookingQueryService } from '@/modules/location-booking/app/ILocationBookingQuery.service';
import { GetBookedDatesByDateRangeDto } from '@/common/dto/location-booking/GetBookedDatesByDateRange.dto';
import { BookedDatesResponseDto } from '@/common/dto/location-booking/res/BookedDate.response.dto';

@ApiTags('Location Booking')
@ApiBearerAuth()
@Roles(Role.EVENT_CREATOR)
@Controller('/creator/location-booking')
export class LocationBookingCreatorController {
  constructor(
    @Inject(ILocationBookingQueryService)
    private readonly locationBookingQueryService: ILocationBookingQueryService,
  ) {}

  @ApiOperation({
    summary: 'Get booked dates by date range',
    description:
      'Returns all booked dates with PAYMENT_RECEIVED status that overlap with the specified date range',
  })
  @Get('/booked-dates')
  getBookedDatesByDateRange(
    @Query() dto: GetBookedDatesByDateRangeDto,
  ): Promise<BookedDatesResponseDto> {
    return this.locationBookingQueryService.getBookedDatesByDateRange(dto);
  }
}
