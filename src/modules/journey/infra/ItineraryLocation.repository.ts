import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ItineraryLocationEntity } from '../domain/ItineraryLocation.entity';

@Injectable()
export class ItineraryLocationRepository {
  public readonly repo: Repository<ItineraryLocationEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.repo = this.dataSource.getRepository(ItineraryLocationEntity);
  }

  async deleteByItineraryId(itineraryId: string): Promise<void> {
    await this.repo.delete({ itineraryId });
  }

  async createMany(
    locations: Partial<ItineraryLocationEntity>[],
  ): Promise<ItineraryLocationEntity[]> {
    const entities = this.repo.create(locations);
    return this.repo.save(entities);
  }
}
