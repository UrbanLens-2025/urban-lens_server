import { Controller, Inject } from '@nestjs/common';
import { IFileStorageService } from '@/modules/file-storage/app/IFileStorage.service';

@Controller('/file-storage/dev-only')
export class FileStorageDevOnlyController {
  constructor(
    @Inject(IFileStorageService)
    private readonly fileStorageService: IFileStorageService,
  ) {}
}
