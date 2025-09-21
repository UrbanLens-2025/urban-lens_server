import { Controller, Post } from '@nestjs/common';
import { AuthService } from '@/modules/auth/app/auth.service';
import { AccountSeederService } from '@/modules/auth/app/AccountSeeder.service';
import { plainToInstance } from 'class-transformer';
import { LoginDto } from '@/common/dto/auth/login.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@/common/constants/Role.constant';

@ApiTags('Auth - DEVELOPMENT')
@Controller('/auth/dev-only')
export class AuthDevOnlyController {
  constructor(
    private readonly authService: AuthService,
    private readonly accountSeederService: AccountSeederService,
  ) {}

  @ApiOperation({ summary: 'Get User JWT Token' })
  @Post('/login/user')
  loginAsUser() {
    const userDetails = this.accountSeederService.DEFAULT_USERS.find(
      (i) => i.role === Role.USER,
    );
    console.log(userDetails);
    const loginDto = plainToInstance(LoginDto, userDetails);
    return this.authService.loginUser(loginDto);
  }

  @ApiOperation({ summary: 'Get Admin JWT Token' })
  @Post('/login/admin')
  loginAsAdmin() {
    const adminDetails = this.accountSeederService.DEFAULT_USERS.find(
      (i) => i.role === Role.ADMIN,
    );
    const loginDto = plainToInstance(LoginDto, adminDetails);
    return this.authService.loginAdmin(loginDto);
  }
}
