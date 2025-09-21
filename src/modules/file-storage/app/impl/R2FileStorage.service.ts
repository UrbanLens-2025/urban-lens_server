import { Inject, Injectable } from '@nestjs/common';
import { IFileStorageService } from '@/modules/file-storage/app/IFileStorage.service';
import { CoreService } from '@/common/core/Core.service';
import { R2_CLIENT } from '@/common/core/r2/R2.module';
import { R2Client } from '@/common/core/r2/service/R2Client.service';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { from, Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { Environment } from '@/config/env.config';

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

  uploadFilePublic(key: string, body: Buffer): Observable<string> {
    return from(
      this.r2
        .send(
          new PutObjectCommand({
            Bucket: this.configService.get('R2_PUBLIC_BUCKET_NAME'),
            Key: key,
            Body: body,
            ACL: 'public-read',
          }),
        )
        .then((_) => {
          return `${this.configService.get('R2_PUBLIC_DEVELOPMENT_URL')}/${key}`;
        }),
    );
  }
}
