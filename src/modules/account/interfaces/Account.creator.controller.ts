import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { IOnboardService } from '@/modules/account/app/IOnboard.service';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { OnboardCreatorDto } from '@/common/dto/account/OnboardCreator.dto';

@ApiBearerAuth()
@Roles(Role.EVENT_CREATOR)
@ApiTags('Account - Event Creator')
@Controller('/creator/account')
export class AccountCreatorController {
  constructor(
    @Inject(IOnboardService)
    private readonly onboardService: IOnboardService,
  ) {}

  @Post('/onboard')
  onboard(@AuthUser() userDto: JwtTokenDto, @Body() dto: OnboardCreatorDto) {
    return this.onboardService.onboardCreator(userDto.sub, dto);
  }
}
