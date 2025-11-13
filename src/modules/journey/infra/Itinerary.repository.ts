import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ItineraryEntity } from '../domain/Itinerary.entity';

@Injectable()
export class ItineraryRepository {
  public readonly repo: Repository<ItineraryEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.repo = this.dataSource.getRepository(ItineraryEntity);
  }

  async findById(id: string): Promise<ItineraryEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['locations', 'locations.location'],
      order: {
        locations: {
          order: 'ASC',
        },
      },
    });
  }

  async findByUserId(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<ItineraryEntity[]> {
    return this.repo.find({
      where: { userId },
      relations: ['locations', 'locations.location'],
      order: {
        createdAt: 'DESC',
        locations: {
          order: 'ASC',
        },
      },
      take: limit,
      skip: offset,
    });
  }

  async countByUserId(userId: string): Promise<number> {
    return this.repo.count({ where: { userId } });
  }

  async create(itinerary: Partial<ItineraryEntity>): Promise<ItineraryEntity> {
    const entity = this.repo.create(itinerary);
    return this.repo.save(entity);
  }

  async update(
    id: string,
    data: Partial<ItineraryEntity>,
  ): Promise<ItineraryEntity | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
