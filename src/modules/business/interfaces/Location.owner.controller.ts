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
import { ILocationQueryService } from '@/modules/business/app/ILocationQuery.service';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { Paginate, type PaginateQuery } from 'nestjs-paginate';
import { WithPagination } from '@/common/WithPagination.decorator';
import { ILocationManagementService } from '@/modules/business/app/ILocationManagement.service';
import { UpdateLocationDto } from '@/common/dto/business/UpdateLocation.dto';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';

@ApiBearerAuth()
@ApiTags('Location')
@Roles(Role.BUSINESS_OWNER)
@Controller('/owner/locations')
export class LocationOwnerController {
  constructor(
    @Inject(ILocationQueryService)
    private readonly locationQueryService: ILocationQueryService,
    @Inject(ILocationManagementService)
    private readonly locationManagementService: ILocationManagementService,
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

  @ApiOperation({ summary: 'Update my created location details' })
  @Put('/:locationId')
  updateMyLocationById(
    @Param('locationId', ParseUUIDPipe) locationId: string,
    @AuthUser() userDto: JwtTokenDto,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.locationManagementService.updateLocation({
      ...dto,
      locationId,
      accountId: userDto.sub,
    });
  }
}
