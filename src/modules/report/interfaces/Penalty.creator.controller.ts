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
@Roles(Role.EVENT_CREATOR)
@Controller('/creator/penalty')
export class PenaltyCreatorController {
  constructor(
    @Inject(IPenaltyService)
    private readonly penaltyService: IPenaltyService,
  ) {}

  @ApiOperation({
    summary: 'Get penalties by event ID',
    description: 'Get all penalties for a specific event',
  })
  @ApiParam({
    name: 'eventId',
    description: 'Event identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Get('/event/:eventId')
  getPenaltiesByEventId(@Param('eventId', ParseUUIDPipe) eventId: string) {
    const dto: GetPenaltiesByTargetDto = {
      targetId: eventId,
      targetType: ReportEntityType.EVENT,
    };
    return this.penaltyService.getPenaltiesByTarget(dto);
  }
}

