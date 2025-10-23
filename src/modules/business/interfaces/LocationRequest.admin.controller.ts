import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';
import { ILocationRequestManagementService } from '@/modules/business/app/ILocationRequestManagement.service';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { ProcessLocationRequestDto } from '@/common/dto/business/ProcessLocationRequest.dto';
import {
  ILocationRequestQueryService,
  ILocationRequestQueryService_QueryConfig,
} from '@/modules/business/app/ILocationRequestQuery.service';

@ApiTags('Location Request')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('/admin/location-request')
export class LocationRequestAdminController {
  constructor(
    @Inject(ILocationRequestManagementService)
    private readonly locationRequestManagementService: ILocationRequestManagementService,
    @Inject(ILocationRequestQueryService)
    private readonly locationRequestQueryService: ILocationRequestQueryService,
  ) {}

  @ApiOperation({ summary: 'Search location requests' })
  @ApiPaginationQuery(
    ILocationRequestQueryService_QueryConfig.searchAllLocationRequests(),
  )
  @Get('/search')
  searchAllLocationRequests(@Paginate() query: PaginateQuery) {
    return this.locationRequestQueryService.searchAllLocationRequests(query);
  }

  @ApiOperation({ summary: 'Get location request by ID' })
  @Get('/search/:locationRequestId')
  searchLocationRequestById(
    @Param('locationRequestId', ParseUUIDPipe) locationRequestId: string,
  ) {
    return this.locationRequestQueryService.getAnyLocationRequestById({
      locationRequestId,
    });
  }

  @ApiOperation({ summary: 'Process location request' })
  @Post('/process/:locationRequestId')
  processLocationRequest(
    @Param('locationRequestId', ParseUUIDPipe) locationRequestId: string,
    @AuthUser() user: JwtTokenDto,
    @Body() dto: ProcessLocationRequestDto,
  ) {
    return this.locationRequestManagementService.processLocationRequest({
      ...dto,
      locationRequestId,
      accountId: user.sub,
    });
  }
}
