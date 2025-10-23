import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { ConfigModule } from '@nestjs/config';
import { AccountModule } from '@/modules/account/Account.module';
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
import { FileStorageModule } from '@/modules/file-storage/FileStorage.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { PostModule } from '@/modules/post/Post.module';
import { BusinessModule } from '@/modules/business/Business.module';
import { EventModule } from '@/modules/event/event.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventEmitterConfig } from '@/config/event-emitter.config';
import { LocationReservationModule } from '@/modules/location-reservation/LocationReservation.module';
import { ReportModule } from '@/modules/report/Report.module';
import { GamificationModule } from './modules/gamification/Gamification.module';
import { UtilityModule } from '@/modules/utility/Utility.module';
import { WalletModule } from './modules/wallet/Wallet.module';
import { TestController } from '@/Test.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.development',
      skipProcessEnv: true,
      cache: true,
      validationSchema: envConfig,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
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
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'upload-limit',
          ttl: 60000,
          limit: 10,
        },
        {
          name: 'global-limit',
          ttl: 60,
          limit: 100,
        },
      ],
    }),
    EventEmitterModule.forRoot(EventEmitterConfig),
    NotificationModule,
    AuthModule,
    AccountModule,
    BusinessModule,
    FileStorageModule,
    PostModule,
    EventModule,
    LocationReservationModule,
    ReportModule,
    GamificationModule,
    UtilityModule,
    WalletModule,
  ],
  controllers: [AppController, TestController],
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
})
export class AppModule {}
