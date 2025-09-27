import { Paginated, type PaginateQuery } from 'nestjs-paginate';
import { TagResponse } from '@/common/dto/account/TagResponse.dto';

export const ITagUserService = Symbol('ITagUserService');
export interface ITagUserService {
  listTags(query: PaginateQuery): Promise<Paginated<TagResponse.Dto>>;
}
