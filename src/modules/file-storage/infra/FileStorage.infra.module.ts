import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicFileEntity } from '@/modules/file-storage/domain/PublicFile.entity';
import { PublicFileRepository } from '@/modules/file-storage/infra/repository/PublicFile.repository';

const repositories = [PublicFileRepository];

@Module({
  imports: [TypeOrmModule.forFeature([PublicFileEntity])],
  providers: repositories,
  exports: repositories,
})
export class FileStorageInfraModule {}
