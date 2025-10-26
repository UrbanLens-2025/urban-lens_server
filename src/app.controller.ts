import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Environment } from '@/config/env.config';

@ApiTags('_System')
@ApiBearerAuth()
@Controller()
export class AppController {
  constructor(private readonly configService: ConfigService<Environment>) {}

  @ApiOperation({
    summary: 'Get running version of the service',
  })
  @Get('')
  root(): string {
    return `Server has been running on deployment version (${this.configService.get<string>('RUNTIME_VERSION')}) since ${this.configService.get('DEPLOYED_AT')}`;
  }
}
