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
import {
  ILocationSuspensionService,
  ILocationSuspensionService_QueryConfig,
} from '@/modules/business/app/ILocationSuspension.service';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';
import { SuspendLocationBookingDto } from '@/common/dto/location-booking/SuspendLocationBooking.dto';
import { UpdateLocationSuspensionDto } from '@/common/dto/location-booking/UpdateLocationSuspension.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';

@ApiTags('Location Suspension')
@Controller('/admin/location-suspensions')
@ApiBearerAuth()
@Roles(Role.ADMIN)
export class LocationSuspensionAdminController {
  constructor(
    @Inject(ILocationSuspensionService)
    private readonly locationSuspensionService: ILocationSuspensionService,
  ) {}

  @ApiOperation({ summary: 'Get all location suspensions' })
  @ApiPaginationQuery(
    ILocationSuspensionService_QueryConfig.getAllSuspensions(),
  )
  @Get('/')
  getAllSuspensions(@Paginate() query: PaginateQuery) {
    return this.locationSuspensionService.getAllSuspensions({ query });
  }

  @ApiOperation({ summary: 'Suspend location booking' })
  @Post('/')
  suspendLocationBooking(
    @AuthUser() userDto: JwtTokenDto,
    @Body() dto: SuspendLocationBookingDto,
  ) {
    return this.locationSuspensionService.suspendLocationBooking({
      ...dto,
      accountId: userDto.sub,
    });
  }

  @ApiOperation({ summary: 'Update a location suspension' })
  @Put('/:suspensionId')
  updateLocationSuspension(
    @Param('suspensionId', ParseUUIDPipe) suspensionId: string,
    @Body() dto: UpdateLocationSuspensionDto,
  ) {
    return this.locationSuspensionService.updateLocationSuspension({
      ...dto,
      locationSuspensionId: suspensionId,
    });
  }
}
