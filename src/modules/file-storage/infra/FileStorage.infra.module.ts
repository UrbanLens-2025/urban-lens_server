import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicFileEntity } from '@/modules/file-storage/domain/PublicFile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PublicFileEntity])],
})
export class FileStorageInfraModule {}
