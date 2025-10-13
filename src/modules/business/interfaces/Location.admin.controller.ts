import { ILocationService } from '../app/ILocation.service';
import { Body, Controller, Inject, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { UpdateLocationStatusDto } from '@/common/dto/location/UpdateLocationStatus.dto';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { AuthUser } from '@/common/AuthUser.decorator';

@ApiTags('Location - Admin')
@Controller('admin/locations')
@ApiBearerAuth()
@Roles(Role.ADMIN)
export class LocationAdminController {
  constructor(
    @Inject(ILocationService)
    private readonly locationService: ILocationService,
  ) {}

  @Patch('/:locationId')
  async updateLocationStatus(
    @Param('locationId') locationId: string,
    @Body() updateLocationStatusDto: UpdateLocationStatusDto,
    @AuthUser() admin: JwtTokenDto,
  ) {
    return this.locationService.updateLocationStatus(
      locationId,
      updateLocationStatusDto,
      admin.sub,
    );
  }
}
