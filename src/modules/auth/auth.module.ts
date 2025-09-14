import { Module } from '@nestjs/common';
import { AuthService } from '@/modules/auth/services/auth.service';
import { AuthController } from '@/modules/auth/controllers/auth.controller';
import { TokenService } from '@/modules/auth/services/token.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtConfig } from '@/config/jwt.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/modules/auth/domain/User.entity';
import { UserRepository } from '@/modules/auth/infra/repository/User.repository';
import { NotificationModule } from '@/modules/notification/Notification.module';
import { RedisRegisterConfirmRepository } from '@/modules/auth/infra/repository/RedisRegisterConfirm.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.registerAsync({
      useClass: JwtConfig,
      inject: [ConfigService],
    }),
    NotificationModule,
  ],
  controllers: [AuthController],
  providers: [
    UserRepository,
    RedisRegisterConfirmRepository,
    AuthService,
    TokenService,
  ],
})
export class AuthModule {}
