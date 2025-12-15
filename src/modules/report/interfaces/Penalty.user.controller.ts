import { Controller, Get, Inject } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { IPenaltyService } from '@/modules/report/app/IPenalty.service';
import { GetPenaltiesByTargetOwnerDto } from '@/common/dto/report/GetPenaltiesByTargetOwner.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';

@ApiTags('Penalty')
@ApiBearerAuth()
@Roles(Role.USER)
@Controller('/user/penalty')
export class PenaltyUserController {
  constructor(
    @Inject(IPenaltyService)
    private readonly penaltyService: IPenaltyService,
  ) {}

  @ApiOperation({
    summary: 'Get my penalties',
    description: 'Get all penalties administered to the current user',
  })
  @Get('/my-penalties')
  getMyPenalties(@AuthUser() user: JwtTokenDto) {
    const dto: GetPenaltiesByTargetOwnerDto = {
      targetOwnerId: user.sub,
    };
    return this.penaltyService.getPenaltiesByTargetOwner(dto);
  }
}

