import { Body, Controller, Get, Inject, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { IOnboardService } from '@/modules/account/app/IOnboard.service';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { OnboardCreatorDto } from '@/common/dto/account/OnboardCreator.dto';
import { IAccountProfileService } from '@/modules/account/app/IAccountProfile.service';
import { UpdateCreatorProfileDto } from '@/common/dto/account/UpdateCreatorProfile.dto';

@ApiBearerAuth()
@Roles(Role.EVENT_CREATOR)
@ApiTags('Account')
@Controller('/creator/account')
export class AccountCreatorController {
  constructor(
    @Inject(IOnboardService)
    private readonly onboardService: IOnboardService,
    @Inject(IAccountProfileService)
    private readonly accountProfileService: IAccountProfileService,
  ) {}

  @ApiOperation({ summary: 'Onboard Event Creator' })
  @Post('/onboard')
  onboard(@AuthUser() userDto: JwtTokenDto, @Body() dto: OnboardCreatorDto) {
    return this.onboardService.onboardCreator(userDto.sub, dto);
  }

  @ApiOperation({ summary: 'Get my Event Creator profile' })
  @Get('/profile')
  getMyProfile(@AuthUser() userDto: JwtTokenDto) {
    return this.accountProfileService.getCreatorProfile({
      accountId: userDto.sub,
    });
  }

  @ApiOperation({ summary: 'Update my Event Creator Profile' })
  @Put('/profile')
  updateMyProfile(
    @AuthUser() userDto: JwtTokenDto,
    @Body() dto: UpdateCreatorProfileDto,
  ) {
    return this.accountProfileService.updateCreatorProfile({
      ...dto,
      accountId: userDto.sub,
    });
  }
}
