import { Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ILocationQueryService } from '@/modules/business/app/ILocationQuery.service';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';

@ApiBearerAuth()
@ApiTags('Location')
@Controller('/owner/locations')
export class LocationBusinessController {
  constructor(
    @Inject(ILocationQueryService)
    private readonly locationQueryService: ILocationQueryService,
  ) {}

  @Get()
  getMyLocations(@AuthUser() userDto: JwtTokenDto) {
    return this.locationQueryService.getMyCreatedLocations({
      businessId: userDto.sub,
    });
  }

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
