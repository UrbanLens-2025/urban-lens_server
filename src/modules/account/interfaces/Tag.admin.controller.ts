import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateTag } from '@/common/dto/account/CreateTag.dto';

@ApiTags('Tag - Admin')
@Controller('/admin/tag')
export class TagAdminController {
  @Post()
  create(dto: CreateTag.Dto) {}
}
