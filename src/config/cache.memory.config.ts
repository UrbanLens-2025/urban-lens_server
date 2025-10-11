import { CacheModuleOptions, CacheOptionsFactory } from '@nestjs/common/cache';

export class CacheMemoryConfig implements CacheOptionsFactory {
  createCacheOptions():
    | CacheModuleOptions<Record<string, any>>
    | Promise<CacheModuleOptions<Record<string, any>>> {
    return {
      isGlobal: true,
      ttl: 1000 * 60 * 60, // 1 hour
      max: 100, // maximum number of items in cache
    };
  }
}
