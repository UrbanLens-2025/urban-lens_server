import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { ConfigModule } from '@nestjs/config';
import { AccountModule } from '@/modules/account/Account.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersistenceConfig } from '@/config/persistence.config';
import { envConfig } from '@/config/env.config';
import { NotificationModule } from '@/modules/notification/Notification.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptorConfig } from '@/common/interceptor/response.interceptor';
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
import { LocationBookingModule } from '@/modules/location-booking/LocationBooking.module';
import { ReportModule } from '@/modules/report/Report.module';
import { GamificationModule } from './modules/gamification/Gamification.module';
import { UtilityModule } from '@/modules/utility/Utility.module';
import { WalletModule } from './modules/wallet/Wallet.module';
import { TestController } from '@/Test.controller';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { GlobalExceptionFilter } from '@/common/filters/GlobalException.filter';
import { TagScoreWorkerController } from '@/workers/TagScoreWorker.controller';
import { TagScoreWorkerService } from '@/workers/TagScoreWorker.service';
import { PostReactionWorkerController } from '@/workers/PostReactionWorker.controller';
import { PostReactionWorkerService } from '@/workers/PostReactionWorker.service';
import { ReviewWorkerController } from '@/workers/ReviewWorker.controller';
import { ReviewWorkerService } from '@/workers/ReviewWorker.service';
import { JourneyModule } from './modules/journey/Journey.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ScheduledJobsModule } from '@/modules/scheduled-jobs/ScheduledJobs.module';
import { DelayedMessageModule } from '@/common/core/delayed-message/DelayedMessage.module';
@Module({
  imports: [
    // DevtoolsModule.register({
    //   http: process.env.NODE_ENV !== 'production', // Enable HTTP integration in non-production environments
    // }),
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
    SentryModule.forRoot(),
    TokenModule,
    RedisModule.forRootAsync({
      useClass: RedisConfig,
      imports: [ConfigModule],
    }),
    TypeOrmModule.forRootAsync({
      useClass: PersistenceConfig,
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
    ScheduleModule.forRoot({}),
    EventEmitterModule.forRoot(EventEmitterConfig),
    NotificationModule,
    AuthModule,
    AccountModule,
    BusinessModule,
    FileStorageModule,
    PostModule,
    EventModule,
    LocationBookingModule,
    ReportModule,
    GamificationModule,
    UtilityModule,
    WalletModule,
    JourneyModule,
    ScheduledJobsModule,
    DelayedMessageModule,
  ],
  controllers: [
    AppController,
    TestController,
    TagScoreWorkerController,
    PostReactionWorkerController,
    ReviewWorkerController,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
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
    TagScoreWorkerService,
    PostReactionWorkerService,
    ReviewWorkerService,
  ],
})
export class AppModule {}
