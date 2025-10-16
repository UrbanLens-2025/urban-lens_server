import { Body, Controller, Inject, Post } from '@nestjs/common';
import { IFileStorageService } from '@/modules/file-storage/app/IFileStorage.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('_Development')
@Controller('/dev-only/file-storage')
export class FileStorageDevOnlyController {
  constructor(
    @Inject(IFileStorageService)
    private readonly fileStorageService: IFileStorageService,
  ) {}

  @Post()
  async confirmUpload(@Body() body: { fileUrl: string[] }) {
    return this.fileStorageService.confirmUpload(body.fileUrl);
  }
}
