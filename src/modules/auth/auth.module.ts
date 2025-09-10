import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './controllers/auth.controller';
import { TokenService } from './services/token.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { NotificationModule } from '@/modules/notification/Notification.module';
import { Environment } from '@/config/env.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtConfig } from '@/config/jwt.config';

@Module({
  imports: [
    JwtModule.registerAsync({
      useClass: JwtConfig,
      inject: [ConfigService],
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService],
})
export class AuthModule {}
