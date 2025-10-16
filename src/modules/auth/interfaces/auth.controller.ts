import { Body, Controller, Get, Inject, Patch } from '@nestjs/common';
import { IUserAuthService } from '@/modules/auth/app/IUser.auth.service';
import { IAuthService } from '@/modules/auth/app/IAuth.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { UpdateUserAccountDto } from '@/common/dto/auth/UpdateUserAccount.dto';
import { ChangePasswordDto } from '@/common/dto/auth/ChangePassword.dto';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(IUserAuthService)
    private readonly authUserService: IUserAuthService,
    @Inject(IAuthService) private readonly authService: IAuthService,
  ) {}

  @ApiOperation({
    summary: 'Get current auth profile',
    description: 'MUST send jwt token in HTTP headers',
  })
  @Get('/profile')
  getProfile(@AuthUser() user: JwtTokenDto) {
    return this.authUserService.getUser(user);
  }

  @ApiOperation({
    summary: 'Update current auth profile',
  })
  @Patch('/profile')
  updateProfile(
    @AuthUser() user: JwtTokenDto,
    @Body() dto: UpdateUserAccountDto,
  ) {
    return this.authUserService.updateUser(user, dto);
  }

  @ApiOperation({ summary: 'Change password' })
  @Patch('/profile/password')
  changePassword(
    @AuthUser() user: JwtTokenDto,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user, dto);
  }
}
