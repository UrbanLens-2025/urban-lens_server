import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersistenceConfig } from '@/config/persistence.config';
import { envConfig } from '@/config/env.config';
import { NotificationModule } from '@/modules/notification/Notification.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptorConfig } from '@/common/interceptor/response.interceptor';
import { BullModule } from '@nestjs/bullmq';
import { BullConfig } from '@/config/bull.config';
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from '@nestjs-modules/ioredis';
import { RedisConfig } from '@/config/redis.config';
import { FirebaseAdminProvider } from '@/config/firebase.config';
import { JwtAuthGuard } from '@/common/JwtAuth.guard';
import { TokenModule } from '@/common/core/token/token.module';
import { RolesGuard } from '@/common/Roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.development',
      skipProcessEnv: true,
      cache: true,
      validationSchema: envConfig,
    }),
    TokenModule,
    RedisModule.forRootAsync({
      useClass: RedisConfig,
      imports: [ConfigModule],
    }),
    TypeOrmModule.forRootAsync({
      useClass: PersistenceConfig,
      imports: [ConfigModule],
    }),
    BullModule.forRootAsync({
      useClass: BullConfig,
      imports: [ConfigModule],
    }),
    NotificationModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptorConfig,
    },
    FirebaseAdminProvider,
    AppService,
  ],
  exports: [],
})
export class AppModule {}
