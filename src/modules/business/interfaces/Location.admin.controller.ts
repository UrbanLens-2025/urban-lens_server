import { Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { ILocationQueryService } from '@/modules/business/app/ILocationQuery.service';
import { Paginate, type PaginateQuery } from 'nestjs-paginate';
import { WithPagination } from '@/common/WithPagination.decorator';

@ApiTags('Location')
@Controller('/admin/locations')
@ApiBearerAuth()
@Roles(Role.ADMIN)
export class LocationAdminController {
  constructor(
    @Inject(ILocationQueryService)
    private readonly locationQueryService: ILocationQueryService,
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
}
