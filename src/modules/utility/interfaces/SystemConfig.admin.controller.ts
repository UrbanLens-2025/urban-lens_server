import { Role } from '@/common/constants/Role.constant';
import { SystemConfigKey } from '@/common/constants/SystemConfigKey.constant';
import { UpdateSystemConfigValueDto } from '@/common/dto/utility/UpdateSystemConfigValue.dto';
import { Roles } from '@/common/Roles.decorator';
import { ISystemConfigService } from '@/modules/utility/app/ISystemConfig.service';
import { Body, Controller, Get, Inject, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';

@Controller('/admin/system-config')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@ApiTags('System Config')
export class SystemConfigAdminController {
  constructor(
    @Inject(ISystemConfigService)
    private readonly systemConfigService: ISystemConfigService,
  ) {}

  @ApiOperation({ summary: 'Get all system config keys' })
  @Get('/keys')
  getSystemConfigKeys() {
    return this.systemConfigService.getSystemConfigKeys();
  }

  @ApiOperation({ summary: 'Get all system config values' })
  @Get('/values')
  getSystemConfigValues() {
    return this.systemConfigService.getAllSystemConfigValues();
  }

  @ApiOperation({ summary: 'Get a system config value by key' })
  @Get('/value/:key')
  getSystemConfigValue(@Param('key') key: string) {
    return this.systemConfigService.getSystemConfigValue(
      key as SystemConfigKey,
    );
  }

  @ApiOperation({ summary: 'Update a system config value by key' })
  @Put('/value/:key')
  updateSystemConfigValue(
    @Param('key') key: string,
    @Body() dto: UpdateSystemConfigValueDto<SystemConfigKey>,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.systemConfigService.updateSystemConfigValue({
      ...dto,
      key: key as SystemConfigKey,
      accountId: user.sub,
    });
  }
}
