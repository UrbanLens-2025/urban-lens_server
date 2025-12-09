import { CoreService } from '@/common/core/Core.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment } from '@/config/env.config';
import { In } from 'typeorm';
import { SystemConfigRepository } from '@/modules/utility/infra/repository/SystemConfig.repository';
import { SystemConfigKey } from '@/common/constants/SystemConfigKey.constant';
import { SystemConfigEntity } from '@/modules/utility/domain/SystemConfig.entity';

@Injectable()
export class SystemConfigSeeder extends CoreService implements OnModuleInit {
  private readonly logger = new Logger(SystemConfigSeeder.name);

  constructor(private readonly configService: ConfigService<Environment>) {
    super();
  }

  async onModuleInit(): Promise<void> {
    if (!this.configService.get('ENABLE_SYSTEM_CONFIG_SEEDING')) {
      this.logger.debug('System config seeding disabled. Skipping.');
      return;
    }

    await this.seedSystemConfigs();
  }

  private async seedSystemConfigs(): Promise<void> {
    await this.ensureTransaction(null, async (em) => {
      const repository = SystemConfigRepository(em);

      const allKeys = Object.values(SystemConfigKey);

      const existing = await repository.find({
        where: { key: In(allKeys) },
        select: { key: true },
      });
      const existingKeys = new Set(existing.map((config) => config.key));

      const keysToCreate = allKeys.filter((key) => !existingKeys.has(key));

      if (!keysToCreate.length) {
        this.logger.debug('All system config keys already exist. Skipping.');
        return;
      }

      await repository.save(
        keysToCreate.map((key) => new SystemConfigEntity(key)),
      );

      this.logger.debug(
        `Created ${keysToCreate.length} system config(s): ${keysToCreate.join(', ')}`,
      );
    });
  }
}
