import {
  Controller,
  Inject,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { IFileStorageService } from '@/modules/file-storage/app/IFileStorage.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

@Controller('/file-storage/dev-only')
export class FileStorageDevOnlyController {
  constructor(
    @Inject(IFileStorageService)
    private readonly fileStorageService: IFileStorageService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  uploadPublic(@UploadedFile() file: Express.Multer.File) {
    return this.fileStorageService.uploadFilePublic(
      file.originalname,
      file.buffer,
    );
  }
}
