import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ILocationQueryService,
  ILocationQueryService_QueryConfig,
} from '@/modules/business/app/ILocationQuery.service';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';
import { ILocationManagementService } from '@/modules/business/app/ILocationManagement.service';
import { UpdateLocationDto } from '@/common/dto/business/UpdateLocation.dto';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { AddLocationTagDto } from '@/common/dto/business/AddLocationTag.dto';
import { RemoveLocationTagDto } from '@/common/dto/business/RemoveLocationTag.dto';
import {
  ILocationSuspensionService,
  ILocationSuspensionService_QueryConfig,
} from '@/modules/business/app/ILocationSuspension.service';
import {
  ICheckInV2Service,
  ICheckInV2Service_QueryConfig,
} from '@/modules/business/app/ICheckInV2.service';

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
    @Inject(ILocationSuspensionService)
    private readonly locationSuspensionService: ILocationSuspensionService,
    @Inject(ICheckInV2Service)
    private readonly checkInV2Service: ICheckInV2Service,
  ) {}

  @ApiOperation({ summary: 'Get all check ins for my location' })
  @ApiPaginationQuery(ICheckInV2Service_QueryConfig.getAllCheckIns())
  @Get('/all-check-ins')
  getAllCheckIns(@Paginate() query: PaginateQuery) {
    return this.checkInV2Service.getAllCheckIns({
      query,
    });
  }

  @ApiOperation({ summary: 'Get my created locations' })
  @ApiPaginationQuery(ILocationQueryService_QueryConfig.getMyCreatedLocations())
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

  @ApiOperation({
    summary: 'Get my created location by ID',
    description:
      'Get location details with statistics (check-ins, revenue, announcements, vouchers, and missions)',
  })
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
    return this.locationManagementService.updateOwnedLocation({
      ...dto,
      locationId,
      accountId: userDto.sub,
    });
  }

  @ApiOperation({ summary: 'Add tag to my location' })
  @Post('/:locationId/tags')
  addTagToMyLocationById(
    @Param('locationId', ParseUUIDPipe) locationId: string,
    @AuthUser() userDto: JwtTokenDto,
    @Body() dto: AddLocationTagDto,
  ) {
    return this.locationManagementService.addTag({
      ...dto,
      locationId,
      accountId: userDto.sub,
    });
  }

  @ApiOperation({ summary: 'Delete tag at my location' })
  @Delete('/:locationId/tags')
  removeTagFromMyLocationById(
    @Param('locationId', ParseUUIDPipe) locationId: string,
    @AuthUser() userDto: JwtTokenDto,
    @Body() dto: RemoveLocationTagDto,
  ) {
    return this.locationManagementService.softRemoveTag({
      ...dto,
      locationId,
      accountId: userDto.sub,
    });
  }

  @ApiOperation({ summary: 'Get all suspensions for my location' })
  @ApiPaginationQuery(
    ILocationSuspensionService_QueryConfig.getAllSuspensions(),
  )
  @Get('/:locationId/suspensions')
  getSuspensionsForMyLocation(
    @Param('locationId', ParseUUIDPipe) locationId: string,
    @Paginate() query: PaginateQuery,
  ) {
    return this.locationSuspensionService.getAllSuspensions({
      query: {
        ...query,
        filter: {
          ...query.filter,
          locationId: '$eq:' + locationId,
        },
      },
    });
  }
}
