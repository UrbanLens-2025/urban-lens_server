import { S3ClientConfig } from '@aws-sdk/client-s3';
import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { R2Client } from '@/common/core/r2/service/R2Client.service';

export const R2_CLIENT = Symbol('R2_CLIENT');

export type R2ModuleOptions = S3ClientConfig;

export interface R2OptionsFactory {
  createS3Options(): Promise<R2ModuleOptions> | R2ModuleOptions;
}

export interface R2ModuleAsyncOptions {
  imports?: any[];
  inject?: any[];
  useFactory?: (...args: any[]) => Promise<R2ModuleOptions> | R2ModuleOptions;
  useClass?: Type<R2OptionsFactory>;
  useExisting?: Type<R2OptionsFactory>;
}

@Module({})
export class R2Module {
  static register(options: R2ModuleOptions): DynamicModule {
    return {
      module: R2Module,
      providers: [
        {
          provide: R2_CLIENT,
          useValue: new R2Client(options),
        },
      ],
      exports: [R2_CLIENT],
    };
  }

  static registerAsync(options: R2ModuleAsyncOptions): DynamicModule {
    const providers: Provider[] = [];

    if (options.useFactory) {
      providers.push({
        provide: R2_CLIENT,
        useFactory: async (...args: any[]) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          new R2Client(await options.useFactory!(...args)),
        inject: options.inject || [],
      });
    } else if (options.useClass) {
      providers.push(
        {
          provide: options.useClass,
          useClass: options.useClass,
        },
        {
          provide: R2_CLIENT,
          useFactory: async (factory: R2OptionsFactory) =>
            new R2Client(await factory.createS3Options()),
          inject: [options.useClass],
        },
      );
    } else if (options.useExisting) {
      providers.push({
        provide: R2_CLIENT,
        useFactory: async (factory: R2OptionsFactory) =>
          new R2Client(await factory.createS3Options()),
        inject: [options.useExisting],
      });
    }

    return {
      module: R2Module,
      imports: options.imports || [],
      providers,
      exports: [R2_CLIENT],
    };
  }
}
