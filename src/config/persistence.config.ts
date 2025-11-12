import { Injectable, Logger } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Environment } from '@/config/env.config';

@Injectable({})
export class PersistenceConfig implements TypeOrmOptionsFactory {
  private readonly logger = new Logger(PersistenceConfig.name);

  constructor(private readonly configService: ConfigService<Environment>) {}

  createTypeOrmOptions(
    connectionName?: string,
  ): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    if (this.configService.get('DATABASE_ENABLE_SYNC')) {
      this.logger.warn(
        'Database synchronization is not supported. Please write migration scripts.',
      );
    }

    return {
      type: 'postgres',
      host: this.configService.get('DATABASE_HOST'),
      port: this.configService.get('DATABASE_PORT'),
      username: this.configService.get('DATABASE_USER'),
      password: this.configService.get('DATABASE_PASSWORD'),
      database: this.configService.get('DATABASE_NAME'),
      synchronize: this.configService.get('DATABASE_ENABLE_SYNC'),
      schema: this.configService.get('DATABASE_SCHEMA'),
      logging: 'all',
      autoLoadEntities: true,
    };
  }
}
