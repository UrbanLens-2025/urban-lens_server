import { ISystemConfigService } from '@/modules/utility/app/ISystemConfig.service';
import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('System Config')
@Controller('/public/system-config')
export class SystemConfigPublicController {
  constructor(
    @Inject(ISystemConfigService)
    private readonly systemConfigService: ISystemConfigService,
  ) {}

  @Get('/values')
  getSystemConfigValues() {
    return this.systemConfigService.getAllSystemConfigValues();
  }
}
