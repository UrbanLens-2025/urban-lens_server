import { CreateTagDto } from '@/common/dto/account/CreateTag.dto';
import { TagResponseDto } from '@/common/dto/account/TagResponse.dto';
import { Paginated, PaginateQuery } from 'nestjs-paginate';

export const ITagService = Symbol('ITagService');
export interface ITagService {
  create(dto: CreateTagDto): Promise<TagResponseDto>;
  search(query: PaginateQuery): Promise<Paginated<TagResponseDto>>;
}
