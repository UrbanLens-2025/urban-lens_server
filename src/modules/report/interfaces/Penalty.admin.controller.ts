import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { IPenaltyService } from '@/modules/report/app/IPenalty.service';
import { CreatePenalty_WarnUserDto } from '@/common/dto/report/CreatePenalty_WarnUser.dto';
import { CreatePenalty_SuspendAccountDto } from '@/common/dto/report/CreatePenalty_SuspendAccount.dto';
import { CreatePenalty_BanAccountDto } from '@/common/dto/report/CreatePenalty_BanAccount.dto';
import { CreatePenalty_SuspendLocationBookingAbilityDto } from '@/common/dto/report/CreatePenalty_SuspendLocationBookingAbility.dto';
import { CreatePenalty_BanPostDto } from '@/common/dto/report/CreatePenalty_BanPost.dto';
import { CreatePenalty_SuspendEventCreationAbilityDto } from '@/common/dto/report/CreatePenalty_SuspendEventCreationAbility.dto';
import { CreatePenalty_ForceCancelEventDto } from '@/common/dto/report/CreatePenalty_ForceCancelEvent.dto';
import { CreatePenalty_SuspendLocationDto } from '@/common/dto/report/CreatePenalty_SuspendLocation.dto';
import { GetPenaltiesByTargetDto } from '@/common/dto/report/GetPenaltiesByTarget.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { CreatePenalty_FineLocationBookingDto } from '@/common/dto/report/CreatePenalty_FineLocationBooking.dto';

@ApiTags('Penalty')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('/admin/penalty')
export class PenaltyAdminController {
  constructor(
    @Inject(IPenaltyService)
    private readonly penaltyService: IPenaltyService,
  ) {}

  @ApiOperation({
    summary: 'Warn user',
    description: 'Create a penalty to warn a user for a specific entity',
  })
  @Post('/warn-user')
  createPenalty_WarnUser(
    @Body() dto: CreatePenalty_WarnUserDto,
    @AuthUser() admin: JwtTokenDto,
  ) {
    dto.createdById = admin.sub;
    return this.penaltyService.createPenalty_WarnUser(dto);
  }

  @ApiOperation({
    summary: 'Suspend account',
    description: 'Create a penalty to suspend an account for a specific entity',
  })
  @Post('/suspend-account')
  createPenalty_SuspendAccount(
    @Body() dto: CreatePenalty_SuspendAccountDto,
    @AuthUser() admin: JwtTokenDto,
  ) {
    dto.createdById = admin.sub;
    return this.penaltyService.createPenalty_SuspendAccount(dto);
  }

  @ApiOperation({
    summary: 'Ban account',
    description: 'Create a penalty to ban an account for a specific entity',
  })
  @Post('/ban-account')
  createPenalty_BanAccount(
    @Body() dto: CreatePenalty_BanAccountDto,
    @AuthUser() admin: JwtTokenDto,
  ) {
    dto.createdById = admin.sub;
    return this.penaltyService.createPenalty_BanAccount(dto);
  }

  @ApiOperation({
    summary: 'Suspend location booking ability',
    description:
      'Create a penalty to suspend location booking ability for a specific location',
  })
  @Post('/suspend-location-booking')
  createPenalty_SuspendLocationBookingAbility(
    @Body() dto: CreatePenalty_SuspendLocationBookingAbilityDto,
    @AuthUser() admin: JwtTokenDto,
  ) {
    dto.createdById = admin.sub;
    return this.penaltyService.createPenalty_SuspendLocationBookingAbility(dto);
  }

  @ApiOperation({
    summary: 'Ban post',
    description: 'Create a penalty to ban a post',
  })
  @Post('/ban-post')
  createPenalty_BanPost(
    @Body() dto: CreatePenalty_BanPostDto,
    @AuthUser() admin: JwtTokenDto,
  ) {
    dto.createdById = admin.sub;
    return this.penaltyService.createPenalty_BanPost(dto);
  }

  @ApiOperation({
    summary: 'Suspend event creation ability',
    description:
      'Create a penalty to suspend event creation ability for a specific target entity',
  })
  @Post('/suspend-event-creation')
  createPenalty_SuspendEventCreationAbility(
    @Body() dto: CreatePenalty_SuspendEventCreationAbilityDto,
    @AuthUser() admin: JwtTokenDto,
  ) {
    dto.createdById = admin.sub;
    return this.penaltyService.createPenalty_SuspendEventCreationAbility(dto);
  }

  @ApiOperation({
    summary: 'Force cancel event',
    description: 'Create a penalty to force cancel an event',
  })
  @Post('/force-cancel-event')
  createPenalty_ForceCancelEvent(
    @Body() dto: CreatePenalty_ForceCancelEventDto,
    @AuthUser() admin: JwtTokenDto,
  ) {
    dto.createdById = admin.sub;
    return this.penaltyService.createPenalty_ForceCancelEvent(dto);
  }

  @ApiOperation({
    summary: 'Suspend location',
    description: 'Create a penalty to suspend a location',
  })
  @Post('/suspend-location')
  createPenalty_SuspendLocation(
    @Body() dto: CreatePenalty_SuspendLocationDto,
    @AuthUser() admin: JwtTokenDto,
  ) {
    dto.createdById = admin.sub;
    return this.penaltyService.createPenalty_SuspendLocation(dto);
  }

  @ApiOperation({
    summary: 'Get penalties by target',
    description:
      'Get all penalties for a specific target entity (post, location, or event)',
  })
  @Get('/by-target')
  getPenaltiesByTarget(@Query() dto: GetPenaltiesByTargetDto) {
    return this.penaltyService.getPenaltiesByTarget(dto);
  }

  @ApiOperation({
    summary: 'Fine location booking',
    description: 'Create a penalty to fine a location booking',
  })
  @Post('/fine-location-booking')
  createPenalty_FineLocationBooking(
    @Body() dto: CreatePenalty_FineLocationBookingDto,
    @AuthUser() admin: JwtTokenDto,
  ) {
    dto.createdById = admin.sub;
    return this.penaltyService.createPenalty_FineLocationBooking(dto);
  }
}
