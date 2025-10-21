import { Body, Controller, Inject, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { IOnboardService } from '@/modules/account/app/IOnboard.service';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { OnboardCreatorDto } from '@/common/dto/account/OnboardCreator.dto';
import { IAccountProfileManagementService } from '@/modules/account/app/IAccountProfileManagement.service';
import { UpdateCreatorProfileDto } from '@/common/dto/account/UpdateCreatorProfile.dto';

@ApiTags('Account')
@ApiBearerAuth()
@Roles(Role.EVENT_CREATOR)
@Controller('/creator/account')
export class AccountCreatorController {
  constructor(
    @Inject(IOnboardService)
    private readonly onboardService: IOnboardService,
    @Inject(IAccountProfileManagementService)
    private readonly accountProfileManagementService: IAccountProfileManagementService,
  ) {}

  @ApiOperation({ summary: 'Onboard Event Creator' })
  @Post('/onboard')
  onboard(@AuthUser() userDto: JwtTokenDto, @Body() dto: OnboardCreatorDto) {
    return this.onboardService.onboardCreator(userDto.sub, dto);
  }

  @ApiOperation({ summary: 'Update my Event Creator Profile' })
  @Put('/profile')
  updateMyProfile(
    @AuthUser() userDto: JwtTokenDto,
    @Body() dto: UpdateCreatorProfileDto,
  ) {
    return this.accountProfileManagementService.updateCreatorProfile({
      ...dto,
      accountId: userDto.sub,
    });
  }
}
