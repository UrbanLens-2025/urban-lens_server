import { CreateTagDto } from '@/common/dto/account/CreateTag.dto';
import { TagResponseDto } from '@/common/dto/account/res/TagResponse.dto';
import { PaginateConfig, Paginated, PaginateQuery } from 'nestjs-paginate';
import { TagEntity } from '@/modules/utility/domain/Tag.entity';
import { UpdateResult } from 'typeorm';
import { UpdateTagDto } from '@/common/dto/account/UpdateTag.dto';

export const ITagService = Symbol('ITagService');
export interface ITagService {
  create(dto: CreateTagDto): Promise<TagResponseDto>;
  search(query: PaginateQuery): Promise<Paginated<TagResponseDto>>;
  update(dto: UpdateTagDto): Promise<UpdateResult>;

  searchSelectable(query: PaginateQuery): Promise<Paginated<TagResponseDto>>;
}

export namespace ITagService_QueryConfig {
  export function search(): PaginateConfig<TagEntity> {
    return {
      sortableColumns: ['displayName', 'createdAt', 'updatedAt'],
      defaultSortBy: [['displayName', 'DESC']],
      searchableColumns: ['displayName', 'groupName'],
      filterableColumns: {
        groupName: true,
      },
      nullSort: 'last',
    };
  }

  export function searchSelectable(): PaginateConfig<TagEntity> {
    return {
      sortableColumns: ['displayName', 'createdAt', 'updatedAt'],
      defaultSortBy: [['displayName', 'DESC']],
      searchableColumns: ['displayName', 'groupName'],
      filterableColumns: {
        groupName: true,
      },
      nullSort: 'last',
    };
  }
}
