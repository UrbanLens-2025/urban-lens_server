import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';

@ApiBearerAuth()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/public/get-hello')
  getHello(): string {
    return this.appService.getHello();
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
