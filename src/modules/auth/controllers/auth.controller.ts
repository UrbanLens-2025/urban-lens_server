import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '@/modules/auth/services/auth.service';
import { RegisterDto } from '@/common/dto/auth/register.dto';
import { LoginDto } from '@/common/dto/auth/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() createAuthDto: RegisterDto) {
    return this.authService.register(createAuthDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
