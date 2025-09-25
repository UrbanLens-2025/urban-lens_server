import { Injectable } from '@nestjs/common';
import {
  BullRootModuleOptions,
  SharedBullConfigurationFactory,
} from '@nestjs/bullmq/dist/interfaces/shared-bull-config.interface';
import { ConfigService } from '@nestjs/config';
import { Environment } from '@/config/env.config';

@Injectable()
export class BullConfig implements SharedBullConfigurationFactory {
  constructor(private readonly configService: ConfigService<Environment>) {}

  createSharedConfiguration():
    | Promise<BullRootModuleOptions>
    | BullRootModuleOptions {
    return {
      connection: {
        url: this.configService.get('REDIS_URL'),
      },
      prefix: 'bull:',
    };
  }
}
