import {
  SystemConfigKey,
  SystemConfigValue,
} from '@/common/constants/SystemConfigKey.constant';
import { SystemConfigResponseDto } from '@/common/dto/utility/res/SystemConfig.response.dto';
import { UpdateSystemConfigValueDto } from '@/common/dto/utility/UpdateSystemConfigValue.dto';
import { EntityManager } from 'typeorm';

export const ISystemConfigService = Symbol('ISystemConfigService');

export interface ISystemConfigService {
  getSystemConfigValue<T extends SystemConfigKey>(
    key: T,
    em?: EntityManager,
  ): Promise<SystemConfigResponseDto<T>>;

  getSystemConfigKeys(): Promise<SystemConfigKey[]>;

  getAllSystemConfigValues(): Promise<
    SystemConfigResponseDto<SystemConfigKey>[]
  >;

  updateSystemConfigValue<T extends SystemConfigKey>(
    dto: UpdateSystemConfigValueDto<T>,
  ): Promise<SystemConfigResponseDto<T>>;
}
