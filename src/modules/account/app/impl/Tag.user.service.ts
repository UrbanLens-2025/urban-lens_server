import { ITagUserService } from '@/modules/account/app/ITag.user.service';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { Injectable } from '@nestjs/common';
import { TagRepository } from '@/modules/account/infra/repository/Tag.repository';
import { TagResponse } from '@/common/dto/account/TagResponse.dto';
import { CoreService } from '@/common/core/Core.service';

@Injectable()
export class TagUserService extends CoreService implements ITagUserService {
  constructor(private readonly tagRepository: TagRepository) {
    super();
  }

  async listTags(query: PaginateQuery): Promise<Paginated<TagResponse.Dto>> {
    const res = await paginate(query, this.tagRepository.repo, {
      sortableColumns: ['createdAt', 'updatedAt', 'displayName'],
      nullSort: 'last',
    });
    return {
      ...res,
      data: res.data.map((i) => this.mapTo(TagResponse.Dto, i)),
    } as Paginated<TagResponse.Dto>;
  }
}
