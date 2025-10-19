import { Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ILocationQueryService } from '@/modules/business/app/ILocationQuery.service';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { Paginate, type PaginateQuery } from 'nestjs-paginate';
import { WithPagination } from '@/common/WithPagination.decorator';

@ApiBearerAuth()
@ApiTags('Location')
@Controller('/owner/locations')
export class LocationOwnerController {
  constructor(
    @Inject(ILocationQueryService)
    private readonly locationQueryService: ILocationQueryService,
  ) {}

  @ApiOperation({ summary: 'Get my created locations' })
  @WithPagination()
  @Get()
  getMyLocations(
    @AuthUser() userDto: JwtTokenDto,
    @Paginate() query: PaginateQuery,
  ) {
    return this.locationQueryService.getMyCreatedLocations({
      businessId: userDto.sub,
      query,
    });
  }

  @ApiOperation({ summary: 'Get my created location by ID' })
  @Get('/:locationId')
  getMyLocationById(
    @Param('locationId', ParseUUIDPipe) locationId: string,
    @AuthUser() userDto: JwtTokenDto,
  ) {
    return this.locationQueryService.getMyCreatedLocationById({
      businessId: userDto.sub,
      locationId,
    });
  }
}
