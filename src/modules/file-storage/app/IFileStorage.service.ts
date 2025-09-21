import { Observable } from 'rxjs';

export const IFileStorageService = Symbol('IFileStorageService');
export interface IFileStorageService {
  uploadFilePublic(key: string, body: Buffer): Observable<string>;
}
