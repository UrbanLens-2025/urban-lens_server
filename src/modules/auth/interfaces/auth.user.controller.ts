import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserAuthService } from '@/modules/auth/app/User.auth.service';
import { UpdateUserAccountDto } from '@/common/dto/auth/UpdateUserAccount.dto';
import { ChangePasswordDto } from '@/common/dto/auth/ChangePassword.dto';
import { AuthService } from '@/modules/auth/app/auth.service';
import { OnboardUser } from '@/common/dto/auth/Onboarding.dto';

@ApiTags('Auth - User')
@ApiBearerAuth()
@Controller('/user/auth')
export class AuthUserController {
  constructor(
    private readonly userService: UserAuthService,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({
    summary: 'Get current user profile',
    description: 'MUST send jwt token in HTTP headers',
  })
  @Get('/profile')
  getProfile(@AuthUser() user: JwtTokenDto) {
    return this.userService.getUser(user);
  }

  @ApiOperation({
    summary: 'Update current user profile',
  })
  @Patch('/profile')
  updateProfile(
    @AuthUser() user: JwtTokenDto,
    @Body() dto: UpdateUserAccountDto,
  ) {
    return this.userService.updateUser(user, dto);
  }

  @ApiOperation({ summary: 'Change user password' })
  @Patch('/profile/password')
  changePassword(
    @AuthUser() user: JwtTokenDto,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user, dto);
  }

  @ApiOperation({ summary: 'Onboard user' })
  @Post('/onboard')
  onboardUser(@AuthUser() user: JwtTokenDto, @Body() dto: OnboardUser.DTO) {
    return this.userService.onboardUser(user.sub, dto);
  }
}
