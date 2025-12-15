import { Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { IPenaltyService } from '@/modules/report/app/IPenalty.service';
import { GetPenaltiesByTargetDto } from '@/common/dto/report/GetPenaltiesByTarget.dto';
import { ReportEntityType } from '@/modules/report/domain/Report.entity';

@ApiTags('Penalty')
@ApiBearerAuth()
@Roles(Role.BUSINESS_OWNER)
@Controller('/owner/penalty')
export class PenaltyOwnerController {
  constructor(
    @Inject(IPenaltyService)
    private readonly penaltyService: IPenaltyService,
  ) {}

  @ApiOperation({
    summary: 'Get penalties by location ID',
    description: 'Get all penalties for a specific location',
  })
  @ApiParam({
    name: 'locationId',
    description: 'Location identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Get('/location/:locationId')
  getPenaltiesByLocationId(
    @Param('locationId', ParseUUIDPipe) locationId: string,
  ) {
    const dto: GetPenaltiesByTargetDto = {
      targetId: locationId,
      targetType: ReportEntityType.LOCATION,
    };
    return this.penaltyService.getPenaltiesByTarget(dto);
  }
}

