import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TagCategoryEntity } from '@/modules/utility/domain/TagCategory.entity';

@Injectable()
export class TagCategoryRepository {
  constructor(
    @InjectRepository(TagCategoryEntity)
    public readonly repo: Repository<TagCategoryEntity>,
  ) {}

  async findAll(): Promise<TagCategoryEntity[]> {
    return this.repo.find({
      order: { name: 'ASC' },
    });
  }

  async findById(id: number): Promise<TagCategoryEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<TagCategoryEntity | null> {
    return this.repo.findOne({ where: { name } });
  }

  async create(data: Partial<TagCategoryEntity>): Promise<TagCategoryEntity> {
    const category = this.repo.create(data);
    return this.repo.save(category);
  }

  async update(
    id: number,
    data: Partial<TagCategoryEntity>,
  ): Promise<TagCategoryEntity | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
