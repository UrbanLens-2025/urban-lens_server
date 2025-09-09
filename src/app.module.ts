import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersistenceConfig } from '@/config/persistence.config';
import { envConfig, Environment } from '@/config/env.config';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailerConfig } from '@/config/mailer.config';
import { NotificationModule } from '@/modules/notification/Notification.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptorConfig } from '@/common/interceptor/response.interceptor';
import { BullModule } from '@nestjs/bullmq';
import { BullConfig } from '@/config/bull.config';
import { AuthModule } from './modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfig } from '@/config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.development',
      skipProcessEnv: true,
      cache: true,
      validationSchema: envConfig,
    }),
    TypeOrmModule.forRootAsync({
      useClass: PersistenceConfig,
      imports: [ConfigModule],
    }),
    MailerModule.forRootAsync({
      useClass: MailerConfig,
      imports: [ConfigModule],
    }),
    BullModule.forRootAsync({
      useClass: BullConfig,
      imports: [ConfigModule],
    }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService<Environment>) => ({
        secretOrPrivateKey: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') },
      }),
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    NotificationModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptorConfig,
    },
    AppService,
  ],
})
export class AppModule {}
