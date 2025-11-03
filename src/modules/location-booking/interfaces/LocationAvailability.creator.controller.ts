import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { Controller, Inject } from '@nestjs/common';
import { ILocationAvailabilityManagementService } from '@/modules/location-booking/app/ILocationAvailabilityManagement.service';

@ApiTags('Location Availability')
@ApiBearerAuth()
@Roles(Role.EVENT_CREATOR)
@Controller('/creator/location-availability')
export class LocationAvailabilityCreatorController {
  constructor(
    @Inject(ILocationAvailabilityManagementService)
    private readonly locationAvailabilityManagement: ILocationAvailabilityManagementService,
  ) {}
}
