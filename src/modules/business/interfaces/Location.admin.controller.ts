import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { ILocationQueryService } from '@/modules/business/app/ILocationQuery.service';
import { Paginate, type PaginateQuery } from 'nestjs-paginate';
import { WithPagination } from '@/common/WithPagination.decorator';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { UpdateLocationDto } from '@/common/dto/business/UpdateLocation.dto';
import { ILocationManagementService } from '@/modules/business/app/ILocationManagement.service';

@ApiTags('Location')
@Controller('/admin/locations')
@ApiBearerAuth()
@Roles(Role.ADMIN)
export class LocationAdminController {
  constructor(
    @Inject(ILocationQueryService)
    private readonly locationQueryService: ILocationQueryService,
    @Inject(ILocationManagementService)
    private readonly locationManagementService: ILocationManagementService,
  ) {}

  @ApiOperation({ summary: 'Get all locations in database for management' })
  @WithPagination()
  @Get('/search')
  async searchLocations(@Paginate() query: PaginateQuery) {
    return this.locationQueryService.searchAnyLocation(query);
  }

  @ApiOperation({ summary: 'Get any location by ID for management' })
  @Get('/:locationId')
  async getLocationById(
    @Param('locationId', ParseUUIDPipe) locationId: string,
  ) {
    return this.locationQueryService.getAnyLocationById({
      locationId,
    });
  }

  @ApiOperation({
    summary: 'Update any location details (both business owned and public)',
  })
  @Put('/:locationId')
  updateMyLocationById(
    @Param('locationId', ParseUUIDPipe) locationId: string,
    @AuthUser() userDto: JwtTokenDto,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.locationManagementService.forceUpdateLocation({
      ...dto,
      locationId,
      accountId: userDto.sub,
    });
  }
}
