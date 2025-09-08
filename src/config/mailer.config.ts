import { MailerOptions, MailerOptionsFactory } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment } from '@/config/env.config';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';

@Injectable()
export class MailerConfig implements MailerOptionsFactory {
  constructor(private readonly configService: ConfigService<Environment>) {}

  createMailerOptions(): Promise<MailerOptions> | MailerOptions {
    return {
      template: {
        dir: __dirname + '/assets/templates',
        adapter: new PugAdapter(),
        options: {
          strict: true,
        },
      },
      transport: {
        host: this.configService.get('MAILER_HOST'),
        port: this.configService.get('MAILER_PORT'),
        secure: this.configService.get('MAILER_SECURE'),
        auth: {
          user: this.configService.get('MAILER_USERNAME'),
          pass: this.configService.get('MAILER_PASSWORD'),
        },
      },
    };
  }
}
