import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
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
import { EntityManager, In } from 'typeorm';
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

  private readonly logger = new Logger(R2FileStorageService.name);
  private static readonly MAX_NORMAL_SIZE = 5 * 1024 * 1024; // 5MB

  async confirmUpload(
    fileUrl: (string | null | undefined)[],
    manager?: EntityManager,
  ): Promise<PublicFileEntity[]> {
    const filteredUrls = fileUrl.filter((url): url is string => !!url);

    if (filteredUrls.length === 0) {
      return [];
    }

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
          const missingFiles = filteredUrls.filter(
            (url) => !files.some((file) => file.fileUrl === url),
          );
          this.logger.warn(
            'Some files not found in the database: ' + missingFiles.join(', '),
          );
          // TODO - decide if this should throw an error or just log a warning
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

    return from(
      // save try to db.
      this.ensureTransaction(null, async (entityManager) => {
        const publicFileRepository = PublicFileRepository(entityManager);
        const fileEntity = PublicFileEntity.fromFile(body, userDto.sub);
        fileEntity.createdById = userDto.sub;

        fileEntity.status = PublicFileStatus.AWAITING_UPLOAD;
        return await publicFileRepository.save(fileEntity);
      })
        // upload to r2.
        .then(async (savedFile) => {
          try {
            await this.uploadToR2WithRetry(
              savedFile.fileName,
              body.buffer,
              3, // max retries
            );
            return savedFile;
          } catch (error) {
            await this.ensureTransaction(null, async (em) => {
              const repo = PublicFileRepository(em);
              await repo.update(savedFile.id, {
                status: PublicFileStatus.FAILED_UPLOAD,
              });
            });
            throw error;
          }
        })
        // confirm upload to db.
        .then((savedFile) =>
          this.ensureTransaction(null, async (em) => {
            const publicFileRepository = PublicFileRepository(em);
            const url = `${this.configService.get('R2_PUBLIC_DEVELOPMENT_URL')}/${savedFile.fileName}`;
            savedFile.status = PublicFileStatus.AWAITING_CONFIRM_SIGNAL;
            savedFile.fileUrl = url;
            await publicFileRepository.save(savedFile);
            return url;
          }).catch((error) => {
            // DB update failed but file is in R2 - log for cleanup job
            this.logger.error(
              `File uploaded to R2 but DB update failed: ${savedFile.fileName}`,
              error,
            );
            throw error;
          }),
        ),
    );
  }

  private async uploadToR2WithRetry(
    fileName: string,
    buffer: Buffer,
    maxRetries = 3,
  ): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.r2.send(
          new PutObjectCommand({
            Bucket: this.configService.get('R2_PUBLIC_BUCKET_NAME'),
            Key: fileName,
            Body: buffer,
            ACL: 'public-read',
          }),
        );
        return; // success
      } catch (error) {
        this.logger.warn(
          `R2 upload attempt ${attempt}/${maxRetries} failed: ${error instanceof Error ? error.message : String(error)}`,
        );

        if (attempt === maxRetries) {
          throw error; // final attempt failed
        }

        // Exponential backoff: 1s, 2s, 4s
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)),
        );
      }
    }
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
