import {
  ForbiddenException,
  Inject,
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
import { IFileStorageService } from '@/modules/file-storage/app/IFileStorage.service';

@Injectable()
export class ItineraryService implements IItineraryService {
  constructor(
    private readonly itineraryRepository: ItineraryRepository,
    private readonly itineraryLocationRepository: ItineraryLocationRepository,
    private readonly dataSource: DataSource,
    @Inject(IFileStorageService)
    private readonly fileStorageService: IFileStorageService,
  ) {}

  async createItinerary(
    userId: string,
    dto: CreateItineraryDto,
  ): Promise<ItineraryEntity> {
    return this.dataSource.transaction(async (manager) => {
      // Confirm upload for thumbnail if provided
      if (dto.thumbnailUrl) {
        await this.fileStorageService.confirmUpload(
          [dto.thumbnailUrl],
          manager,
        );
      }

      // Create itinerary (manual source)
      const itinerary = manager.create(ItineraryEntity, {
        userId,
        title: dto.title,
        description: dto.description,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        source: ItinerarySource.MANUAL,
        album: [], // Album is always empty when creating itinerary
        thumbnailUrl: dto.thumbnailUrl,
        // For manual creation, wishlist should be empty
        locationWishlist: [],
      });

      const savedItinerary = await manager.save(itinerary);

      // Create itinerary locations
      if (dto.locations && dto.locations.length > 0) {
        const locations = dto.locations.map((loc) =>
          manager.create(ItineraryLocationEntity, {
            itineraryId: savedItinerary.id,
            locationId: loc.locationId,
            order: loc.order,
            notes: loc.notes,
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
      // Confirm upload for thumbnail if provided
      if (dto.thumbnailUrl) {
        await this.fileStorageService.confirmUpload(
          [dto.thumbnailUrl],
          manager,
        );
      }

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
        album: [], // Album is always empty when creating itinerary
        thumbnailUrl: dto.thumbnailUrl,
        locationWishlist: dto.locationWishlist || [],
      });

      const savedItinerary = await manager.save(itinerary);

      if (dto.locationIds && dto.locationIds.length > 0) {
        const locations = dto.locationIds.map((locationId, index) =>
          manager.create(ItineraryLocationEntity, {
            itineraryId: savedItinerary.id,
            locationId,
            order: index + 1,
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
      // Confirm upload for album images if album is being updated
      if (dto.album !== undefined && dto.album.length > 0) {
        await this.fileStorageService.confirmUpload(dto.album, manager);
      }

      // Confirm upload for thumbnail if thumbnailUrl is being updated
      if (dto.thumbnailUrl !== undefined) {
        await this.fileStorageService.confirmUpload(
          [dto.thumbnailUrl],
          manager,
        );
      }

      // Update itinerary basic info
      const updateData: Partial<ItineraryEntity> = {};
      if (dto.title !== undefined) updateData.title = dto.title;
      if (dto.description !== undefined)
        updateData.description = dto.description;
      if (dto.startDate !== undefined)
        updateData.startDate = new Date(dto.startDate);
      if (dto.endDate !== undefined) updateData.endDate = new Date(dto.endDate);
      if (dto.album !== undefined) updateData.album = dto.album;
      if (dto.thumbnailUrl !== undefined)
        updateData.thumbnailUrl = dto.thumbnailUrl;
      if (dto.locationWishlist !== undefined)
        updateData.locationWishlist = dto.locationWishlist;

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
              notes: loc.notes,
            }),
          );

          await manager.save(locations);
        }
      }

      // Fetch complete itinerary with relations using manager to get updated data
      const result = await manager.getRepository(ItineraryEntity).findOne({
        where: { id: itineraryId },
        relations: ['locations', 'locations.location'],
        order: {
          locations: {
            order: 'ASC',
          },
        },
      });

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
