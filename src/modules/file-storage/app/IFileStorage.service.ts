import { Observable } from 'rxjs';
import { AllowedUploadTypes } from '@/common/constants/AllowedUploadTypes.constant';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { PublicFileEntity } from '@/modules/file-storage/domain/PublicFile.entity';
import { EntityManager } from 'typeorm';

export const IFileStorageService = Symbol('IFileStorageService');
export interface IFileStorageService {
  uploadFilePublic(
    uploadType: AllowedUploadTypes[],
    body: Express.Multer.File,
    userDto: JwtTokenDto,
  ): Observable<string>;

  /**
   * Confirm the upload of files by updating their status to IN_USE
   * @param fileUrl Array of file URLs to confirm upload
   * @param manager Optional EntityManager for transaction management
   */
  confirmUpload(
    fileUrl: (string | null | undefined)[],
    manager?: EntityManager,
  ): Promise<PublicFileEntity[]>;
}
