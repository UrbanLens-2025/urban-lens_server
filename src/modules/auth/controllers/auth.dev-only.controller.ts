import { Controller, Post } from '@nestjs/common';
import { AuthService } from '@/modules/auth/services/auth.service';
import { AccountSeederService } from '@/modules/auth/services/account-seeder.service';
import { plainToInstance } from 'class-transformer';
import { LoginDto } from '@/common/dto/auth/login.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth - Dev Only')
@Controller('/auth/dev-only')
export class AuthDevOnlyController {
  constructor(
    private readonly authService: AuthService,
    private readonly accountSeederService: AccountSeederService,
  ) {}

  @ApiOperation({ summary: 'Get User JWT Token' })
  @Post('/login/user')
  loginAsUser() {
    const userDetails = this.accountSeederService.DEFAULT_USER_DETAILS;
    const loginDto = plainToInstance(LoginDto, userDetails);
    return this.authService.login(loginDto);
  }
}
