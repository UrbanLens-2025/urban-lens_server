import { R2ModuleOptions, R2OptionsFactory } from '@/common/core/r2/R2.module';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment } from '@/config/env.config';

@Injectable()
export class R2Config implements R2OptionsFactory {
  constructor(private readonly configService: ConfigService<Environment>) {}

  createS3Options(): Promise<R2ModuleOptions> | R2ModuleOptions {
    return {
      region: 'auto',
      endpoint: this.configService.get('R2_ENDPOINT')!,
      credentials: {
        accessKeyId: this.configService.get('R2_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get('R2_SECRET_ACCESS_KEY')!,
      },
    };
  }
}
