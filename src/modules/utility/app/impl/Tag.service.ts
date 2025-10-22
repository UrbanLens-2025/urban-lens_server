import { CoreService } from '@/common/core/Core.service';
import { CreateTagDto } from '@/common/dto/account/CreateTag.dto';
import { TagResponseDto } from '@/common/dto/account/res/TagResponse.dto';
import {
  ITagService,
  ITagService_QueryConfig,
} from '@/modules/utility/app/ITag.service';
import { ConflictException, Injectable } from '@nestjs/common';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { TagEntity } from '@/modules/utility/domain/Tag.entity';
import { TagRepositoryProvider } from '@/modules/utility/infra/repository/Tag.repository';

@Injectable()
export class TagService extends CoreService implements ITagService {
  constructor() {
    super();
  }
  async create(dto: CreateTagDto): Promise<TagResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const tagRepository = TagRepositoryProvider(manager);

      const existsDuplicate = await tagRepository.existsDuplicate({
        items: dto.list.map((item) => ({
          displayName: item.displayName,
          groupName: item.groupName,
        })),
      });

      if (existsDuplicate) {
        throw new ConflictException(
          'One or more tags with the same display name and group name already exist',
        );
      }

      const tags = dto.list.map((item) => this.mapTo_safe(TagEntity, item));
      return tagRepository
        .save(tags)
        .then((res) => this.mapTo(TagResponseDto, res));
    });
  }

  async search(query: PaginateQuery): Promise<Paginated<TagResponseDto>> {
    const tagRepository = this.dataSource.getRepository(TagEntity);
    return paginate(query, tagRepository, {
      ...ITagService_QueryConfig.search(),
    });
  }

  searchSelectable(query: PaginateQuery): Promise<Paginated<TagResponseDto>> {
    const tagRepository = this.dataSource.getRepository(TagEntity);
    return paginate(query, tagRepository, {
      ...ITagService_QueryConfig.search(),
      where: {
        isSelectable: true,
      },
    });
  }
}
