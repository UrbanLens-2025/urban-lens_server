import { CreateTag } from '@/common/dto/account/CreateTag.dto';
import { TagResponse } from '@/common/dto/account/TagResponse.dto';

export const ITagAdminService = Symbol('ITagAdminService');
export interface ITagAdminService {
  create(dto: CreateTag.Dto): Promise<TagResponse.Dto>;
}
