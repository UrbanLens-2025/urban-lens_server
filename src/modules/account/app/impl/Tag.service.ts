import { CoreService } from '@/common/core/Core.service';
import { CreateTag } from '@/common/dto/account/CreateTag.dto';
import { TagResponseDto } from '@/common/dto/account/TagResponse.dto';
import { ITagService } from '@/modules/account/app/ITag.service';
import { ConflictException, Injectable } from '@nestjs/common';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { TagEntity } from '@/modules/account/domain/Tag.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class TagService extends CoreService implements ITagService {
  constructor(private readonly dataSource: DataSource) {
    super();
  }

  async create(dto: CreateTag.Dto): Promise<TagResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const tagRepository = manager.getRepository(TagEntity);

      const isNotUnique = await tagRepository.existsBy({
        displayName: dto.displayName,
      });

      if (isNotUnique) {
        throw new ConflictException(
          'Tag with this display name already exists',
        );
      }

      const tag = this.mapTo_Raw(TagEntity, dto);
      return tagRepository
        .save(tag)
        .then((res) => this.mapTo(TagResponseDto, res));
    });
  }

  async search(query: PaginateQuery): Promise<Paginated<TagResponseDto>> {
    const tagRepository = this.dataSource.getRepository(TagEntity);
    return paginate(query, tagRepository, {
      sortableColumns: ['displayName', 'createdAt', 'updatedAt'],
      defaultSortBy: [['displayName', 'DESC']],
      searchableColumns: ['displayName'],
      nullSort: 'last',
    });
  }
}
