import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IFileStorageService } from '@/modules/file-storage/app/IFileStorage.service';
import { CoreService } from '@/common/core/Core.service';
import { R2_CLIENT } from '@/common/core/r2/R2.module';
import { R2Client } from '@/common/core/r2/service/R2Client.service';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { from, Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { Environment } from '@/config/env.config';
import {
  AllowedUploadMimeTypes,
  AllowedUploadTypes,
} from '@/common/constants/AllowedUploadTypes.constant';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { PublicFileEntity } from '@/modules/file-storage/domain/PublicFile.entity';
import { PublicFileStatus } from '@/common/constants/PublicFileStatus.constant';
import { DataSource, EntityManager, In } from 'typeorm';
import { PublicFileRepository } from '@/modules/file-storage/infra/repository/PublicFile.repository';

@Injectable()
export class R2FileStorageService
  extends CoreService
  implements IFileStorageService
{
  constructor(
    @Inject(R2_CLIENT) private readonly r2: R2Client,
    private readonly configService: ConfigService<Environment>,
  ) {
    super();
  }

  private static readonly MAX_NORMAL_SIZE = 5 * 1024 * 1024; // 5MB

  async confirmUpload(
    fileUrl: (string | null | undefined)[],
    manager?: EntityManager,
  ): Promise<PublicFileEntity[]> {
    const filteredUrls = fileUrl.filter((url): url is string => !!url);

    return this.ensureTransaction(
      manager,
      async (manager: EntityManager): Promise<PublicFileEntity[]> => {
        const publicFileRepository = PublicFileRepository(manager);
        const files = await publicFileRepository.find({
          where: { fileUrl: In(filteredUrls) },
        });

        if (
          !files ||
          files.length === 0 ||
          files.length !== filteredUrls.length
        ) {
          throw new NotFoundException('File(s) not found');
        }

        files.forEach((file) => (file.status = PublicFileStatus.IN_USE));

        return publicFileRepository.save(files);
      },
    );
  }

  uploadFilePublic(
    uploadType: AllowedUploadTypes[],
    body: Express.Multer.File,
    userDto: JwtTokenDto,
  ): Observable<string> {
    if (!body) {
      throw new BadRequestException('No file provided');
    }

    if (!this.validateFile(uploadType, body)) {
      throw new BadRequestException('Invalid file type');
    }

    if (!this.validateFileSize(body)) {
      throw new BadRequestException(
        'File size exceeds the maximum limit of 5MB',
      );
    }

    // save to db, if failed, cancel upload to r2
    const fileEntity = PublicFileEntity.fromFile(body, userDto.sub);
    fileEntity.createdById = userDto.sub;
    fileEntity.status = PublicFileStatus.AWAITING_UPLOAD;

    return from(
      this.dataSource.transaction(async (entityManager) => {
        const publicFileRepository = PublicFileRepository(entityManager);

        const savedFile = await publicFileRepository.save(fileEntity);

        await this.r2.send(
          new PutObjectCommand({
            Bucket: this.configService.get('R2_PUBLIC_BUCKET_NAME'),
            Key: fileEntity.fileName,
            Body: body.buffer,
            ACL: 'public-read',
          }),
        );

        const url = `${this.configService.get('R2_PUBLIC_DEVELOPMENT_URL')}/${savedFile.fileName}`;
        savedFile.status = PublicFileStatus.AWAITING_CONFIRM_SIGNAL;
        savedFile.fileUrl = url;
        await publicFileRepository.save(savedFile);

        return url;
      }),
    );
  }

  private validateFile(
    allowedTypes: AllowedUploadTypes[],
    file: Express.Multer.File,
  ): boolean {
    const allowedMimeTypes = allowedTypes.flatMap(
      (allowedType) => AllowedUploadMimeTypes[allowedType],
    );

    return allowedMimeTypes.includes(file.mimetype);
  }

  private validateFileSize(file: Express.Multer.File): boolean {
    return file.size <= R2FileStorageService.MAX_NORMAL_SIZE;
  }
}
