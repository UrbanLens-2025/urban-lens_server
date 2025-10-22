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
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { CreateLocationRequestFromBusinessDto } from '@/common/dto/business/CreateLocationRequestFromBusiness.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { ILocationRequestManagementService } from '@/modules/business/app/ILocationRequestManagement.service';
import { UpdateLocationRequestDto } from '@/common/dto/business/UpdateLocationRequest.dto';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';
import { WithPagination } from '@/common/WithPagination.decorator';
import { AddLocationRequestTagsDto } from '@/common/dto/business/AddLocationRequestTags.dto';
import { DeleteLocationRequestTagDto } from '@/common/dto/business/DeleteLocationRequestTag.dto';
import { IFileStorageService } from '@/modules/file-storage/app/IFileStorage.service';
import {
  ILocationRequestQueryService,
  ILocationRequestQueryService_QueryConfig,
} from '@/modules/business/app/ILocationRequestQuery.service';

@ApiTags('Location Request')
@ApiBearerAuth()
@Roles(Role.BUSINESS_OWNER)
@Controller('/business/location-request')
export class LocationRequestBusinessController {
  constructor(
    @Inject(ILocationRequestManagementService)
    private readonly locationRequestManagementService: ILocationRequestManagementService,
    @Inject(ILocationRequestQueryService)
    private readonly locationRequestQueryService: ILocationRequestQueryService,
  ) {}

  @ApiOperation({ summary: 'Get my location requests' })
  @ApiPaginationQuery(
    ILocationRequestQueryService_QueryConfig.getMyLocationRequests(),
  )
  @Get()
  getMyLocationRequests(
    @AuthUser() userDto: JwtTokenDto,
    @Paginate() query: PaginateQuery,
  ) {
    return this.locationRequestQueryService.getMyLocationRequests(
      userDto.sub,
      query,
    );
  }

  @ApiOperation({ summary: 'Get my location request by ID' })
  @Get(':locationRequestId')
  getMyLocationRequestById(
    @AuthUser() userDto: JwtTokenDto,
    @Param('locationRequestId', ParseUUIDPipe) locationRequestId: string,
  ) {
    return this.locationRequestQueryService.getMyLocationRequestById({
      locationRequestId,
      accountId: userDto.sub,
    });
  }

  @ApiOperation({ summary: 'Create location request' })
  @Post()
  createLocationRequest(
    @AuthUser() userDto: JwtTokenDto,
    @Body() dto: CreateLocationRequestFromBusinessDto,
  ) {
    return this.locationRequestManagementService.createLocationRequestFromBusiness(
      {
        ...dto,
        createdById: userDto.sub,
      },
    );
  }

  @ApiOperation({ summary: 'Add tags to location request' })
  @Post(':locationRequestId/tags')
  addLocationRequestTags(
    @AuthUser() userDto: JwtTokenDto,
    @Param('locationRequestId', ParseUUIDPipe) locationRequestId: string,
    @Body() dto: AddLocationRequestTagsDto,
  ) {
    return this.locationRequestManagementService.addLocationRequestTags({
      ...dto,
      locationRequestId,
      accountId: userDto.sub,
    });
  }

  @ApiOperation({ summary: 'Delete tags in location request' })
  @Delete(':locationRequestId/tags')
  deleteLocationRequestTag(
    @AuthUser() userDto: JwtTokenDto,
    @Param('locationRequestId', ParseUUIDPipe) locationRequestId: string,
    @Body() dto: DeleteLocationRequestTagDto,
  ) {
    return this.locationRequestManagementService.deleteLocationRequestTag({
      ...dto,
      locationRequestId,
      accountId: userDto.sub,
    });
  }

  @ApiOperation({
    summary: 'Update location request',
    description: 'Can only update if not approved',
  })
  @Put(':locationRequestId')
  updateLocationRequest(
    @AuthUser() userDto: JwtTokenDto,
    @Param('locationRequestId', ParseUUIDPipe) locationRequestId: string,
    @Body() dto: UpdateLocationRequestDto,
  ) {
    return this.locationRequestManagementService.updateLocationRequest({
      ...dto,
      locationRequestId,
      accountId: userDto.sub,
    });
  }

  @ApiOperation({
    summary: 'Cancel location request',
  })
  @Put(':locationRequestId/cancel')
  cancelLocationRequest(
    @AuthUser() userDto: JwtTokenDto,
    @Param('locationRequestId', ParseUUIDPipe) locationRequestId: string,
  ) {
    return this.locationRequestManagementService.cancelLocationRequest({
      locationRequestId,
      accountId: userDto.sub,
    });
  }
}
