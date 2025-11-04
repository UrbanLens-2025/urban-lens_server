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
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { ILocationBookingConfigManagementService } from '@/modules/location-booking/app/ILocationBookingConfigManagement.service';
import { AddLocationBookingConfigDto } from '@/common/dto/location-booking/AddLocationBookingConfig.dto';
import { UpdateLocationBookingConfigDto } from '@/common/dto/location-booking/UpdateLocationBookingConfig.dto';

@ApiTags('Location Booking Config')
@ApiBearerAuth()
@Roles(Role.BUSINESS_OWNER)
@Controller('/owner/location-booking-config')
export class LocationBookingConfigOwnerController {
  constructor(
    @Inject(ILocationBookingConfigManagementService)
    private readonly locationBookingConfigManagementService: ILocationBookingConfigManagementService,
  ) {}

  @ApiOperation({ summary: 'Create a location booking config' })
  @Post()
  createLocationBooking(
    @AuthUser() user: JwtTokenDto,
    @Body() dto: AddLocationBookingConfigDto,
  ) {
    return this.locationBookingConfigManagementService.addConfig({
      ...dto,
      accountId: user.sub,
    });
  }

  @ApiOperation({ summary: 'Update a location booking config' })
  @Put(':id')
  updateLocationBooking(
    @AuthUser() user: JwtTokenDto,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLocationBookingConfigDto,
  ) {
    return this.locationBookingConfigManagementService.updateConfig({
      ...dto,
      locationId: id,
      accountId: user.sub,
    });
  }

  @ApiOperation({ summary: 'Get a location booking config' })
  @Get(':id')
  getLocationBooking(
    @AuthUser() user: JwtTokenDto,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.locationBookingConfigManagementService.getConfig({
      locationId: id,
    });
  }
}
