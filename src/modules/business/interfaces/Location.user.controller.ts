import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { ILocationQueryService } from '@/modules/business/app/ILocationQuery.service';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { Paginate, type PaginateQuery } from 'nestjs-paginate';
import { WithPagination } from '@/common/WithPagination.decorator';
import { ICheckInV2Service } from '@/modules/business/app/ICheckInV2.service';
import { RegisterCheckInDto } from '@/common/dto/RegisterCheckIn.dto';

@ApiTags('Location')
@ApiBearerAuth()
@Roles(Role.USER)
@Controller('/user/locations')
export class LocationUserController {
  constructor(
    @Inject(ILocationQueryService)
    private readonly locationQueryService: ILocationQueryService,
    @Inject(ICheckInV2Service)
    private readonly checkInV2Service: ICheckInV2Service,
  ) {}

  @ApiOperation({ summary: 'Get my checked in locations' })
  @WithPagination()
  @Get('/check-in')
  getMyCheckedInLocations(
    @AuthUser() userDto: JwtTokenDto,
    @Paginate() query: PaginateQuery,
  ) {
    return this.checkInV2Service.getMyCheckIns({
      accountId: userDto.sub,
      query,
    });
  }

  @ApiOperation({ summary: 'Get my checked in location by ID' })
  @Get('/check-in/:locationId')
  getMyCheckedInLocationById(
    @AuthUser() userDto: JwtTokenDto,
    @Param('locationId', ParseUUIDPipe) locationId: string,
  ) {
    return this.checkInV2Service.getMyCheckInByLocationId({
      accountId: userDto.sub,
      locationId,
    });
  }

  @ApiOperation({ summary: 'Check in at a location' })
  @Post('/:locationId/check-in')
  registerCheckIn(
    @AuthUser() userDto: JwtTokenDto,
    @Param('locationId', ParseUUIDPipe) locationId: string,
    @Body() dto: RegisterCheckInDto,
  ) {
    return this.checkInV2Service.registerCheckIn({
      ...dto,
      accountId: userDto.sub,
      locationId,
    });
  }
}
