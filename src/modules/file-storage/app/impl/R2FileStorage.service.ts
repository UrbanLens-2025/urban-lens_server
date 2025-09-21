import { BadRequestException, Inject, Injectable } from '@nestjs/common';
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

  uploadFilePublic(
    uploadType: AllowedUploadTypes[],
    body: Express.Multer.File,
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
      this.r2
        .send(
          new PutObjectCommand({
            Bucket: this.configService.get('R2_PUBLIC_BUCKET_NAME'),
            Key: body.originalname,
            Body: body.buffer,
            ACL: 'public-read',
          }),
        )
        .then((_) => {
          return `${this.configService.get('R2_PUBLIC_DEVELOPMENT_URL')}/${body.originalname}`;
        }),
    );
  }

  // uploadFilePublic(
  //   uploadType: AllowedUploadTypes[],
  //   key: string,
  //   body: Express.Multer.File,
  // ): Observable<string> {

  // }

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
