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
import { CreateLocationRequestDto } from '@/common/dto/business/CreateLocationRequest.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { ILocationRequestManagementService } from '@/modules/business/app/ILocationRequestManagement.service';
import { UpdateLocationRequestDto } from '@/common/dto/business/UpdateLocationRequest.dto';
import { Paginate, type PaginateQuery } from 'nestjs-paginate';
import { WithPagination } from '@/common/WithPagination.decorator';

@ApiTags('Location Request')
@ApiBearerAuth()
@Roles(Role.BUSINESS_OWNER)
@Controller('/business/location-request')
export class LocationRequestBusinessController {
  constructor(
    @Inject(ILocationRequestManagementService)
    private readonly locationRequestManagementService: ILocationRequestManagementService,
  ) {}

  @ApiOperation({ summary: 'Get my location requests' })
  @WithPagination()
  @Get()
  getMyLocationRequests(
    @AuthUser() userDto: JwtTokenDto,
    @Paginate() query: PaginateQuery,
  ) {
    return this.locationRequestManagementService.getMyLocationRequests(
      userDto.sub,
      query,
    );
  }

  @ApiOperation({ summary: 'Create location request' })
  @Post()
  createLocationRequest(
    @AuthUser() userDto: JwtTokenDto,
    @Body() dto: CreateLocationRequestDto,
  ) {
    return this.locationRequestManagementService.createLocationRequest({
      ...dto,
      createdById: userDto.sub,
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
