import {
  parseSystemConfigValue,
  SystemConfigKey
} from '@/common/constants/SystemConfigKey.constant';
import { CoreService } from '@/common/core/Core.service';
import { SystemConfigResponseDto } from '@/common/dto/utility/res/SystemConfig.response.dto';
import { UpdateSystemConfigValueDto } from '@/common/dto/utility/UpdateSystemConfigValue.dto';
import { ISystemConfigService } from '@/modules/utility/app/ISystemConfig.service';
import { SystemConfigRepository } from '@/modules/utility/infra/repository/SystemConfig.repository';
import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

@Injectable()
export class SystemConfigService
  extends CoreService
  implements ISystemConfigService
{
  async getAllSystemConfigValues(): Promise<
    SystemConfigResponseDto<SystemConfigKey>[]
  > {
    const systemConfigRepository = SystemConfigRepository(this.dataSource);
    return systemConfigRepository
      .find()
      .then((res) =>
        this.mapToArray(SystemConfigResponseDto<SystemConfigKey>, res),
      );
  }

  async updateSystemConfigValue<T extends SystemConfigKey>(
    dto: UpdateSystemConfigValueDto<T>,
  ): Promise<SystemConfigResponseDto<T>> {
    return this.ensureTransaction(null, async (em) => {
      // soft validation
      const validationResult = parseSystemConfigValue(dto.key, dto.value);
      if (
        isNaN(validationResult) ||
        validationResult === null ||
        validationResult === undefined
      ) {
        throw new BadRequestException('Invalid system config value');
      }

      const systemConfigRepository = SystemConfigRepository(em);
      const systemConfig = await systemConfigRepository.findOneOrFail({
        where: {
          key: dto.key,
        },
      });

      systemConfig.value = String(dto.value);
      return systemConfigRepository
        .save(systemConfig)
        .then((res) => this.mapTo(SystemConfigResponseDto<T>, res));
    });
  }

  getSystemConfigKeys(): Promise<SystemConfigKey[]> {
    return Promise.resolve(Object.values(SystemConfigKey));
  }

  getSystemConfigValue<T extends SystemConfigKey>(
    key: T,
    em?: EntityManager,
  ): Promise<SystemConfigResponseDto<T>> {
    return this.ensureTransaction(em, async (em) => {
      const systemConfigRepository = SystemConfigRepository(em);
      const systemConfig = await systemConfigRepository.findOneOrFail({
        where: {
          key,
        },
      });
      return this.mapTo(SystemConfigResponseDto<T>, systemConfig);
    });
  }
}
