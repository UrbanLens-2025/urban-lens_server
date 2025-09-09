import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';
import { Environment } from '@/config/env.config';

@Injectable()
export class JwtConfig implements JwtOptionsFactory {
  constructor(private readonly configService: ConfigService<Environment>) {}

  createJwtOptions(): JwtModuleOptions {
    console.log(this.configService.get<string>('JWT_SECRET'));
    console.log(this.configService.get<string>('JWT_EXPIRES_IN'));
    return {
      secretOrPrivateKey: this.configService.get<string>('JWT_SECRET'),
      signOptions: {
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
      },
    };
  }
}
