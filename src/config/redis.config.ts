import {
  RedisModuleOptions,
  RedisModuleOptionsFactory,
} from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment } from '@/config/env.config';

@Injectable()
export class RedisConfig implements RedisModuleOptionsFactory {
  constructor(private readonly configService: ConfigService<Environment>) {}

  createRedisModuleOptions(): Promise<RedisModuleOptions> | RedisModuleOptions {
    return {
      type: 'single',
      url: this.configService.get('REDIS_URL'),
      options: {},
    };
  }
}
