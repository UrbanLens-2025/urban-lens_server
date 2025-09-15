import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiBearerAuth } from '@nestjs/swagger';

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
}
