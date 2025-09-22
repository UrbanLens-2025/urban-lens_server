import { Observable } from 'rxjs';
import { AllowedUploadTypes } from '@/common/constants/AllowedUploadTypes.constant';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { PublicFileEntity } from '@/modules/file-storage/domain/PublicFile.entity';

export const IFileStorageService = Symbol('IFileStorageService');
export interface IFileStorageService {
  uploadFilePublic(
    uploadType: AllowedUploadTypes[],
    body: Express.Multer.File,
    userDto: JwtTokenDto,
  ): Observable<string>;

  confirmUpload(fileUrl: string[]): Promise<PublicFileEntity[]>;
}
