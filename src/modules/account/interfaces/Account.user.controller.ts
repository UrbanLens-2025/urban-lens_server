import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { IAccountQueryService } from '@/modules/account/app/IAccountQuery.service';
import { OnboardUserDto } from '@/common/dto/account/OnboardUser.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { IOnboardService } from '@/modules/account/app/IOnboard.service';
import { OptionalAuth } from '@/common/decorators/OptionalAuth.decorator';
import { GetLeaderboardSnapshotDto } from '@/common/dto/account/GetLeaderboardSnapshot.dto';

@ApiBearerAuth()
@Roles(Role.USER)
@ApiTags('Account')
@Controller('/user/account')
export class AccountUserController {
  constructor(
    @Inject(IOnboardService)
    private readonly onboardService: IOnboardService,
    @Inject(IAccountQueryService)
    private readonly accountQueryService: IAccountQueryService,
  ) {}

  @ApiOperation({ summary: 'Onboard a user' })
  @Post('/onboard')
  onboard(@Body() dto: OnboardUserDto, @AuthUser() userDto: JwtTokenDto) {
    return this.onboardService.onboardUser(userDto.sub, dto);
  }

  @ApiOperation({
    summary: 'Get user leaderboard',
    description:
      'Get all users ranked by ranking points. If authenticated, also returns your rank position.',
  })
  @Get('/leaderboard')
  @OptionalAuth()
  getLeaderboard(@AuthUser() user?: JwtTokenDto) {
    return this.accountQueryService.getLeaderboard(user?.sub);
  }

  @ApiOperation({
    summary: 'Get leaderboard snapshot',
    description:
      'Get historical leaderboard snapshot for a specific period (monthly, yearly, or seasonal).',
  })
  @Get('/leaderboard/snapshot')
  @OptionalAuth()
  getLeaderboardSnapshot(
    @Query() dto: GetLeaderboardSnapshotDto,
    @AuthUser() user?: JwtTokenDto,
  ) {
    return this.accountQueryService.getLeaderboardSnapshot(dto, user?.sub);
  }
}
