import { Observable } from 'rxjs';
import { AllowedUploadTypes } from '@/common/constants/AllowedUploadTypes.constant';

export const IFileStorageService = Symbol('IFileStorageService');
export interface IFileStorageService {
  uploadFilePublic(
    uploadType: AllowedUploadTypes[],
    body: Express.Multer.File,
  ): Observable<string>;
}
