import { Body, Controller, Get, Inject, Patch } from '@nestjs/common';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateUserAccountDto } from '@/common/dto/auth/UpdateUserAccount.dto';
import { ChangePasswordDto } from '@/common/dto/auth/ChangePassword.dto';
import { IUserAuthService } from '@/modules/auth/app/IUser.auth.service';
import { IAuthService } from '@/modules/auth/app/IAuth.service';

@ApiTags('Auth - User')
@ApiBearerAuth()
@Controller('/user/auth')
export class AuthUserController {
  constructor(
    @Inject(IUserAuthService)
    private readonly authUserService: IUserAuthService,
    @Inject(IAuthService) private readonly authService: IAuthService,
  ) {}

  @ApiOperation({
    summary: 'Get current user profile',
    description: 'MUST send jwt token in HTTP headers',
  })
  @Get('/profile')
  getProfile(@AuthUser() user: JwtTokenDto) {
    return this.authUserService.getUser(user);
  }

  @ApiOperation({
    summary: 'Update current user profile',
  })
  @Patch('/profile')
  updateProfile(
    @AuthUser() user: JwtTokenDto,
    @Body() dto: UpdateUserAccountDto,
  ) {
    return this.authUserService.updateUser(user, dto);
  }

  @ApiOperation({ summary: 'Change user password' })
  @Patch('/profile/password')
  changePassword(
    @AuthUser() user: JwtTokenDto,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user, dto);
  }
}
