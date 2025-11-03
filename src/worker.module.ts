import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { TagScoreWorkerController } from './workers/TagScoreWorker.controller';
import { TagScoreWorkerService } from './workers/TagScoreWorker.service';
import { EmailWorkerController } from './workers/EmailWorker.controller';
import { EmailWorkerService } from './workers/EmailWorker.service';
import { MailerConfig } from '@/config/mailer.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.development', '.env.production'],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      schema: process.env.DATABASE_SCHEMA,
      logging: false,
    }),
    MailerModule.forRootAsync({
      useClass: MailerConfig,
      imports: [ConfigModule],
    }),
  ],
  controllers: [TagScoreWorkerController, EmailWorkerController],
  providers: [TagScoreWorkerService, EmailWorkerService],
})
export class WorkerModule {}
