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
import { OnboardUser } from '@/common/dto/auth/Onboarding.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';

@ApiBearerAuth()
@Roles(Role.USER)
@ApiTags('Account - User')
@Controller('/account/user')
export class AccountUserController {
  constructor(
    @Inject(IAccountUserService)
    private readonly accountUserService: IAccountUserService,
  ) {}

  @ApiOperation({ summary: 'Get user details by id' })
  @Get('/info/:id')
  getAccountInfo(@Param('id', ParseUUIDPipe) id: string) {
    return this.accountUserService.getAccountInfo({ userId: id });
  }

  @ApiOperation({ summary: 'Onboard a user' })
  @Post('/onboard')
  onboard(@Body() dto: OnboardUser.DTO, @AuthUser() userDto: JwtTokenDto) {
    return this.accountUserService.onboardUser(userDto.sub, dto);
  }
}
