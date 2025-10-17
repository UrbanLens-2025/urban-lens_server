import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
import { WithPagination } from '@/common/WithPagination.decorator';
import { Paginate, type PaginateQuery } from 'nestjs-paginate';
import { ILocationRequestManagementService } from '@/modules/business/app/ILocationRequestManagement.service';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { ProcessLocationRequestDto } from '@/common/dto/business/ProcessLocationRequest.dto';

@ApiTags('Location Request')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('/admin/location-request')
export class LocationRequestAdminController {
  constructor(
    @Inject(ILocationRequestManagementService)
    private readonly locationRequestManagementService: ILocationRequestManagementService,
  ) {}

  @Get('/to-process')
  @WithPagination()
  getLocationRequestsToProcess(@Paginate() query: PaginateQuery) {
    return this.locationRequestManagementService.getLocationRequestsToProcess(
      query,
    );
  }

  @Get('/to-process/:locationRequestId')
  getLocationRequestToProcessById(
    @Param('locationRequestId', ParseUUIDPipe) locationRequestId: string,
  ) {
    return this.locationRequestManagementService.getLocationRequestToProcessById(
      {
        locationRequestId,
      },
    );
  }

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
