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
import { WithPagination } from '@/common/WithPagination.decorator';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';
import { CreateLocationRequestFromUserDto } from '@/common/dto/business/CreateLocationRequestFromUser.dto';
import { AddLocationRequestTagsDto } from '@/common/dto/business/AddLocationRequestTags.dto';
import { DeleteLocationRequestTagDto } from '@/common/dto/business/DeleteLocationRequestTag.dto';
import { UpdateLocationRequestDto } from '@/common/dto/business/UpdateLocationRequest.dto';
import { ILocationRequestManagementService } from '@/modules/business/app/ILocationRequestManagement.service';
import {
  ILocationRequestQueryService,
  ILocationRequestQueryService_QueryConfig,
} from '@/modules/business/app/ILocationRequestQuery.service';

@ApiTags('Location Submissions')
@ApiBearerAuth()
@Roles(Role.USER)
@Controller('/user/location-submission')
export class LocationSubmissionUserController {
  constructor(
    @Inject(ILocationRequestManagementService)
    private readonly locationRequestManagementService: ILocationRequestManagementService,
    @Inject(ILocationRequestQueryService)
    private readonly locationRequestQueryService: ILocationRequestQueryService,
  ) {}

  @ApiOperation({ summary: 'Get my location suggestions' })
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

  @ApiOperation({ summary: 'Get my location suggestion by ID' })
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

  @ApiOperation({ summary: 'Create location suggestion' })
  @Post()
  createLocationSuggestion(
    @AuthUser() userDto: JwtTokenDto,
    @Body() dto: CreateLocationRequestFromUserDto,
  ) {
    return this.locationRequestManagementService.createLocationRequestFromUser({
      ...dto,
      createdById: userDto.sub,
    });
  }

  @ApiOperation({ summary: 'Add tags to location suggestion' })
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

  @ApiOperation({ summary: 'Delete tags in location suggestion' })
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
    summary: 'Update location suggestion',
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
    summary: 'Cancel location suggestion',
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
