import { Body, Controller, Get, Patch, Put } from '@nestjs/common';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from '@/modules/auth/services/user.service';
import { UpdateUserDto } from '@/common/dto/auth/UpdateUser.dto';
import { ChangePasswordDto } from '@/common/dto/auth/ChangePassword.dto';
import { AuthService } from '@/modules/auth/services/auth.service';

@ApiTags('Auth - User')
@ApiBearerAuth()
@Controller('/user/auth')
export class AuthUserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Get('/profile')
  getProfile(@AuthUser() user: JwtTokenDto) {
    return this.userService.getUser(user);
  }

  @Put('/profile')
  updateProfile(@AuthUser() user: JwtTokenDto, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(user, dto);
  }

  @Patch('/profile/password')
  changePassword(
    @AuthUser() user: JwtTokenDto,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user, dto);
  }
}
