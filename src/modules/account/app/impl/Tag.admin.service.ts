import { CoreService } from '@/common/core/Core.service';
import { CreateTag } from '@/common/dto/account/CreateTag.dto';
import { TagResponse } from '@/common/dto/account/TagResponse.dto';
import { ITagAdminService } from '@/modules/account/app/ITag.admin.service';
import { ConflictException, Injectable } from '@nestjs/common';
import { TagRepository } from '@/modules/account/infra/repository/Tag.repository';

@Injectable()
export class TagAdminService extends CoreService implements ITagAdminService {
  constructor(private readonly tagRepository: TagRepository) {
    super();
  }

  async create(dto: CreateTag.Dto): Promise<TagResponse.Dto> {
    // validate uniqueness
    const isNotUnique = await this.tagRepository.repo.existsBy({
      displayName: dto.displayName,
    });

    if (isNotUnique) {
      throw new ConflictException('Tag with this display name already exists');
    }

    throw new Error();
  }
}
