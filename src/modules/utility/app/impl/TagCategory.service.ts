import { Injectable } from '@nestjs/common';
import { ITagCategoryService } from '@/modules/utility/app/ITagCategory.service';
import { TagCategoryRepository } from '@/modules/utility/infra/repository/TagCategory.repository';
import { TagCategoryEntity } from '@/modules/utility/domain/TagCategory.entity';

@Injectable()
export class TagCategoryService implements ITagCategoryService {
  constructor(private readonly tagCategoryRepository: TagCategoryRepository) {}

  async getAllCategories(): Promise<
    Pick<TagCategoryEntity, 'id' | 'name' | 'description' | 'color' | 'icon'>[]
  > {
    const categories = await this.tagCategoryRepository.findAll();
    // Only return id, name, description, color, icon - exclude tagScoreWeights
    return categories.map(({ id, name, description, color, icon }) => ({
      id,
      name,
      description,
      color,
      icon,
    }));
  }
}
