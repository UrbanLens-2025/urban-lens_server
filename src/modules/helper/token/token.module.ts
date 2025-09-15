import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtConfig } from '@/config/jwt.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TokenService } from '@/modules/helper/token/token.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useClass: JwtConfig,
      inject: [ConfigService],
    }),
  ],
  providers: [TokenService, JwtConfig],
  exports: [TokenService, JwtModule],
})
export class TokenModule {}
