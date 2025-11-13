import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateItineraryDto } from '@/common/dto/journey/CreateItinerary.dto';
import { CreateItineraryFromAIDto } from '@/common/dto/journey/CreateItineraryFromAI.dto';
import { UpdateItineraryDto } from '@/common/dto/journey/UpdateItinerary.dto';
import { ItineraryEntity } from '../../domain/Itinerary.entity';
import { ItineraryLocationEntity } from '../../domain/ItineraryLocation.entity';
import { ItineraryRepository } from '../../infra/Itinerary.repository';
import { ItineraryLocationRepository } from '../../infra/ItineraryLocation.repository';
import { IItineraryService } from '../IItinerary.service';
import { ItinerarySource } from '@/common/constants/ItinerarySource.constant';

@Injectable()
export class ItineraryService implements IItineraryService {
  constructor(
    private readonly itineraryRepository: ItineraryRepository,
    private readonly itineraryLocationRepository: ItineraryLocationRepository,
    private readonly dataSource: DataSource,
  ) {}

  async createItinerary(
    userId: string,
    dto: CreateItineraryDto,
  ): Promise<ItineraryEntity> {
    return this.dataSource.transaction(async (manager) => {
      // Create itinerary (manual source)
      const itinerary = manager.create(ItineraryEntity, {
        userId,
        title: dto.title,
        description: dto.description,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        source: ItinerarySource.MANUAL,
      });

      const savedItinerary = await manager.save(itinerary);

      // Create itinerary locations
      if (dto.locations && dto.locations.length > 0) {
        const locations = dto.locations.map((loc) =>
          manager.create(ItineraryLocationEntity, {
            itineraryId: savedItinerary.id,
            locationId: loc.locationId,
            order: loc.order,
            activity: loc.activity,
            notes: loc.notes,
            visitDate: loc.visitDate ? new Date(loc.visitDate) : undefined,
          }),
        );

        await manager.save(locations);
      }

      // Fetch complete itinerary with relations using manager
      const result = await manager.getRepository(ItineraryEntity).findOne({
        where: { id: savedItinerary.id },
        relations: ['locations', 'locations.location'],
        order: {
          locations: {
            order: 'ASC',
          },
        },
      });

      if (!result) {
        throw new NotFoundException('Failed to create itinerary');
      }
      return result;
    });
  }

  async createItineraryFromAI(
    userId: string,
    dto: CreateItineraryFromAIDto,
  ): Promise<ItineraryEntity> {
    return this.dataSource.transaction(async (manager) => {
      // Create itinerary with AI source
      const itinerary = manager.create(ItineraryEntity, {
        userId,
        title: dto.title,
        description: dto.description,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        source: ItinerarySource.AI,
        aiMetadata: {
          reasoning: dto.reasoning,
          tips: dto.tips,
          prompt: dto.prompt,
          modelInfo: 'Ollama',
        },
      });

      const savedItinerary = await manager.save(itinerary);

      // Create itinerary locations from locationIds
      if (dto.locationIds && dto.locationIds.length > 0) {
        const locations = dto.locationIds.map((locationId, index) =>
          manager.create(ItineraryLocationEntity, {
            itineraryId: savedItinerary.id,
            locationId,
            order: index + 1,
            activity: dto.locationActivities?.[locationId],
          }),
        );

        await manager.save(locations);
      }

      const result = await manager.getRepository(ItineraryEntity).findOne({
        where: { id: savedItinerary.id },
        relations: ['locations', 'locations.location'],
        order: {
          locations: {
            order: 'ASC',
          },
        },
      });

      if (!result) {
        throw new NotFoundException('Failed to create itinerary from AI');
      }
      return result;
    });
  }

  async getItineraryById(
    userId: string,
    itineraryId: string,
  ): Promise<ItineraryEntity> {
    const itinerary = await this.itineraryRepository.findById(itineraryId);

    if (!itinerary) {
      throw new NotFoundException('Itinerary not found');
    }

    if (itinerary.userId !== userId) {
      throw new ForbiddenException('You do not have access to this itinerary');
    }

    return itinerary;
  }

  async getUserItineraries(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<{ itineraries: ItineraryEntity[]; total: number }> {
    const [itineraries, total] = await Promise.all([
      this.itineraryRepository.findByUserId(userId, limit, offset),
      this.itineraryRepository.countByUserId(userId),
    ]);

    return { itineraries, total };
  }

  async updateItinerary(
    userId: string,
    itineraryId: string,
    dto: UpdateItineraryDto,
  ): Promise<ItineraryEntity> {
    const itinerary = await this.getItineraryById(userId, itineraryId);

    return this.dataSource.transaction(async (manager) => {
      // Update itinerary basic info
      const updateData: Partial<ItineraryEntity> = {};
      if (dto.title !== undefined) updateData.title = dto.title;
      if (dto.description !== undefined)
        updateData.description = dto.description;
      if (dto.startDate !== undefined)
        updateData.startDate = new Date(dto.startDate);
      if (dto.endDate !== undefined) updateData.endDate = new Date(dto.endDate);

      if (Object.keys(updateData).length > 0) {
        await manager.update(ItineraryEntity, itineraryId, updateData);
      }

      // Update locations if provided
      if (dto.locations) {
        // Delete existing locations
        await manager.delete(ItineraryLocationEntity, { itineraryId });

        // Create new locations
        if (dto.locations.length > 0) {
          const locations = dto.locations.map((loc) =>
            manager.create(ItineraryLocationEntity, {
              itineraryId,
              locationId: loc.locationId,
              order: loc.order,
              activity: loc.activity,
              notes: loc.notes,
              visitDate: loc.visitDate ? new Date(loc.visitDate) : undefined,
            }),
          );

          await manager.save(locations);
        }
      }

      // Fetch complete itinerary with relations
      const result = await this.itineraryRepository.findById(itineraryId);
      if (!result) {
        throw new NotFoundException('Failed to update itinerary');
      }
      return result;
    });
  }

  async deleteItinerary(userId: string, itineraryId: string): Promise<void> {
    const itinerary = await this.getItineraryById(userId, itineraryId);

    await this.dataSource.transaction(async (manager) => {
      // Delete locations first
      await manager.delete(ItineraryLocationEntity, { itineraryId });
      // Delete itinerary
      await manager.delete(ItineraryEntity, itineraryId);
    });
  }
}
