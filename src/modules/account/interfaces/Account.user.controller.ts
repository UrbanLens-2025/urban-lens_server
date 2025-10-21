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
import { IAccountUserService } from '@/modules/account/app/IAccount.user.service';
import { OnboardUserDto } from '@/common/dto/account/OnboardUser.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { IOnboardService } from '@/modules/account/app/IOnboard.service';
import { IAccountProfileService } from '@/modules/account/app/IAccountProfile.service';
import { OptionalAuth } from '@/common/decorators/OptionalAuth.decorator';

@ApiBearerAuth()
@Roles(Role.USER)
@ApiTags('Account')
@Controller('/user/account')
export class AccountUserController {
  constructor(
    @Inject(IAccountUserService)
    private readonly accountUserService: IAccountUserService,
    @Inject(IOnboardService)
    private readonly onboardService: IOnboardService,
    @Inject(IAccountProfileService)
    private readonly accountProfileService: IAccountProfileService,
  ) {}

  // @ApiOperation({ summary: 'Get user details by id' })
  // @Get('/info/:id')
  // getAccountInfo(@Param('id', ParseUUIDPipe) id: string) {
  //   return this.accountUserService.getAccountInfo({ userId: id });
  // }

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
    return this.accountProfileService.getLeaderboard(user?.sub);
  }
}
