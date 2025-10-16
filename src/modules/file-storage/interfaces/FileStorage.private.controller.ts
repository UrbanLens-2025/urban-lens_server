import {
  Controller,
  Inject,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { IFileStorageService } from '@/modules/file-storage/app/IFileStorage.service';
import { AllowedUploadTypes } from '@/common/constants/AllowedUploadTypes.constant';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';

@ApiBearerAuth()
@ApiTags('File Storage')
@Controller('/private/file-storage')
export class FileStoragePrivateController {
  constructor(
    @Inject(IFileStorageService)
    private readonly fileStorageService: IFileStorageService,
  ) {}

  @ApiOperation({
    summary: 'Upload a publicly accessible image',
    description:
      'This image will be accessible to anyone with the returned url.',
  })
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
  @Post('/image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  uploadImage(
    @AuthUser() userDto: JwtTokenDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.fileStorageService.uploadFilePublic(
      [AllowedUploadTypes.IMAGE],
      file,
      userDto,
    );
  }
}
