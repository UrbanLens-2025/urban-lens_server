import { Module } from '@nestjs/common';
import { R2Module } from '@/common/core/r2/R2.module';
import { ConfigModule } from '@nestjs/config';
import { R2Config } from '@/config/r2.config';
import { FileStorageDevOnlyController } from '@/modules/file-storage/interfaces/FileStorage.dev-only.controller';
import { IFileStorageService } from '@/modules/file-storage/app/IFileStorage.service';
import { R2FileStorageService } from '@/modules/file-storage/app/impl/R2FileStorage.service';
import { FileStoragePublicController } from '@/modules/file-storage/interfaces/FileStorage.public.controller';

@Module({
  imports: [
    R2Module.registerAsync({
      imports: [ConfigModule],
      useClass: R2Config,
    }),
  ],
  controllers: [FileStorageDevOnlyController, FileStoragePublicController],
  providers: [
    {
      provide: IFileStorageService,
      useClass: R2FileStorageService,
    },
  ],
})
export class FileStorageModule {}
