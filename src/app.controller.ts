import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';

@ApiTags('_App')
@ApiBearerAuth()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiBearerAuth()
  @Get('/public/get-hello')
  getHello(@AuthUser() dto: JwtTokenDto) {
    if (dto.sub) {
      return dto;
    }
    return 'Hello world!';
  }

  @Get('/get-hello')
  getHelloPublic(): string {
    return this.appService.getHello();
  }

  @Roles(Role.ADMIN)
  @Get('/admin')
  getHelloAdmin(): string {
    return this.appService.getHello();
  }
}
