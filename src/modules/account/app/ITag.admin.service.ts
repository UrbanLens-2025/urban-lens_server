import { CreateTag } from '@/common/dto/account/CreateTag.dto';
import { TagResponse } from '@/common/dto/account/TagResponse.dto';
import { Paginated, PaginateQuery } from 'nestjs-paginate';

export const ITagAdminService = Symbol('ITagAdminService');
export interface ITagAdminService {
  create(dto: CreateTag.Dto): Promise<TagResponse.Dto>;
  search(query: PaginateQuery): Promise<Paginated<TagResponse.Dto>>;
}
