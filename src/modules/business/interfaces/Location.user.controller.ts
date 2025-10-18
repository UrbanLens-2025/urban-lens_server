import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { ICheckInService } from '../app/ICheckIn.service';
import { CreateCheckInDto } from '@/common/dto/checkin/CreateCheckIn.dto';
import { ILocationQueryService } from '@/modules/business/app/ILocationQuery.service';

@ApiTags('Location')
@ApiBearerAuth()
@Roles(Role.USER)
@Controller('/user/locations')
export class LocationUserController {
  constructor(
    @Inject(ILocationQueryService)
    private locationQueryService: ILocationQueryService,
  ) {}
}
