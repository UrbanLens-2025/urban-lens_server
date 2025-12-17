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
import { FinishItineraryDto } from '@/common/dto/journey/FinishItinerary.dto';
import { ItineraryEntity } from '../../domain/Itinerary.entity';
import { ItineraryLocationEntity } from '../../domain/ItineraryLocation.entity';
import { ItineraryRepository } from '../../infra/Itinerary.repository';
import { ItineraryLocationRepository } from '../../infra/ItineraryLocation.repository';
import { IItineraryService } from '../IItinerary.service';
import { ItinerarySource } from '@/common/constants/ItinerarySource.constant';
import { IFileStorageService } from '@/modules/file-storage/app/IFileStorage.service';
import { CheckInRepository } from '@/modules/business/infra/repository/CheckIn.repository';
import { ItineraryPdfService } from './ItineraryPdf.service';
// import { GoogleMapsService } from '@/common/core/google-maps/GoogleMaps.service';

@Injectable()
export class ItineraryService implements IItineraryService {
  constructor(
    private readonly itineraryRepository: ItineraryRepository,
    private readonly itineraryLocationRepository: ItineraryLocationRepository,
    private readonly dataSource: DataSource,
    @Inject(IFileStorageService)
    private readonly fileStorageService: IFileStorageService,
    private readonly checkInRepository: CheckInRepository,
    private readonly itineraryPdfService: ItineraryPdfService,
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

      // Calculate totals from locations if not provided
      const totalDistanceKm =
        dto.totalDistanceKm !== undefined
          ? dto.totalDistanceKm
          : dto.locations?.reduce(
              (acc, loc) => acc + (loc.travelDistanceKm || 0),
              0,
            ) || 0;
      const totalTravelMinutes =
        dto.totalTravelMinutes !== undefined
          ? dto.totalTravelMinutes
          : dto.locations?.reduce(
              (acc, loc) => acc + (loc.travelDurationMinutes || 0),
              0,
            ) || 0;

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
        totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
        totalTravelMinutes: Math.trunc(totalTravelMinutes),
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
            travelDistanceKm:
              loc.travelDistanceKm !== undefined
                ? Number(loc.travelDistanceKm)
                : undefined,
            travelDurationMinutes:
              loc.travelDurationMinutes !== undefined
                ? Math.trunc(loc.travelDurationMinutes)
                : undefined,
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
      return result as ItineraryEntity;
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

      // Aggregate totals from DTO if provided (FE/AI sends metrics)
      // Support both AI format (distanceFromPrevious, estimatedTravelTimeMinutes) and entity format
      const summedDistance =
        (dto.locations?.reduce(
          (acc, cur: any) =>
            acc +
            (Number(cur.travelDistanceKm ?? cur.distanceFromPrevious ?? 0) ||
              0),
          0,
        ) as number) || 0;
      const summedMinutes =
        (dto.locations?.reduce(
          (acc: number, cur: any) =>
            acc +
            (Number(
              cur.travelDurationMinutes ?? cur.estimatedTravelTimeMinutes ?? 0,
            ) || 0),
          0,
        ) as number) || 0;

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
        totalDistanceKm:
          dto.totalDistanceKm !== undefined
            ? dto.totalDistanceKm
            : Number(summedDistance.toFixed(2)),
        totalTravelMinutes:
          dto.totalTravelMinutes !== undefined
            ? dto.totalTravelMinutes
            : (dto as any).estimatedTotalTimeMinutes !== undefined
              ? Math.trunc((dto as any).estimatedTotalTimeMinutes)
              : Math.trunc(summedMinutes),
      });

      const savedItinerary = await manager.save(itinerary);

      if (dto.locations && dto.locations.length > 0) {
        const locations = dto.locations.map(
          (loc: any) =>
            manager.create(ItineraryLocationEntity, {
              itineraryId: savedItinerary.id,
              locationId: loc.locationId,
              order: Number(loc.order),
              notes: loc.notes,
              // Map AI format (distanceFromPrevious) or entity format (travelDistanceKm)
              travelDistanceKm:
                typeof loc.travelDistanceKm !== 'undefined'
                  ? Number(loc.travelDistanceKm)
                  : typeof loc.distanceFromPrevious !== 'undefined'
                    ? Number(loc.distanceFromPrevious)
                    : undefined,
              // Map AI format (estimatedTravelTimeMinutes) or entity format (travelDurationMinutes)
              travelDurationMinutes:
                typeof loc.travelDurationMinutes !== 'undefined'
                  ? Math.trunc(Number(loc.travelDurationMinutes))
                  : typeof loc.estimatedTravelTimeMinutes !== 'undefined'
                    ? Math.trunc(Number(loc.estimatedTravelTimeMinutes))
                    : undefined,
            }) as ItineraryLocationEntity,
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
      return result as ItineraryEntity;
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

    // Check which locations the user has checked in
    if (itinerary.locations && itinerary.locations.length > 0) {
      const locationIds = itinerary.locations.map((loc) => loc.locationId);

      // Query all check-ins for this user at these locations in one query
      const checkIns = await this.checkInRepository.repo
        .createQueryBuilder('checkIn')
        .where('checkIn.userProfileId = :userId', { userId })
        .andWhere('checkIn.locationId IN (:...locationIds)', { locationIds })
        .select(['checkIn.locationId'])
        .getMany();

      // Create a Set of checked-in location IDs for quick lookup
      const checkedInLocationIds = new Set(
        checkIns.map((checkIn) => checkIn.locationId),
      );

      // Add isCheckedIn property to each location
      itinerary.locations.forEach((location) => {
        (location as any).isCheckedIn = checkedInLocationIds.has(
          location.locationId,
        );
      });
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
      if (dto.totalDistanceKm !== undefined) {
        updateData.totalDistanceKm = Number(dto.totalDistanceKm.toFixed(2));
      }
      if (dto.totalTravelMinutes !== undefined) {
        updateData.totalTravelMinutes = Math.trunc(dto.totalTravelMinutes);
      }

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
              travelDistanceKm:
                loc.travelDistanceKm !== undefined
                  ? Number(loc.travelDistanceKm)
                  : undefined,
              travelDurationMinutes:
                loc.travelDurationMinutes !== undefined
                  ? Math.trunc(loc.travelDurationMinutes)
                  : undefined,
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
      return result as ItineraryEntity;
    });
  }

  async finishItinerary(
    userId: string,
    itineraryId: string,
    dto: FinishItineraryDto,
  ): Promise<ItineraryEntity> {
    const itinerary = await this.getItineraryById(userId, itineraryId);

    return this.dataSource.transaction(async (manager) => {
      const updateData: any = {
        isFinished: dto.isFinished,
      };

      // Set finishedAt timestamp when marking as finished
      if (dto.isFinished) {
        updateData.finishedAt = new Date();
      } else {
        // Clear finishedAt when unmarking as finished
        // Use null to clear nullable field in TypeORM
        updateData.finishedAt = null;
      }

      await manager.update(ItineraryEntity, itineraryId, updateData);

      // Fetch complete itinerary with relations
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
        throw new NotFoundException('Failed to update itinerary finish status');
      }
      return result as ItineraryEntity;
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

  async exportItineraryToPdf(
    userId: string,
    itineraryId: string,
  ): Promise<Buffer> {
    const itinerary = await this.getItineraryById(userId, itineraryId);
    return await this.itineraryPdfService.generatePdf(itinerary);
  }

  async getItineraryByIdPublic(itineraryId: string): Promise<ItineraryEntity> {
    const itinerary = await this.itineraryRepository.findById(itineraryId);

    if (!itinerary) {
      throw new NotFoundException('Itinerary not found');
    }

    // Return itinerary without user check-in status for public access
    return itinerary;
  }

  async exportItineraryToPdfPublic(itineraryId: string): Promise<Buffer> {
    const itinerary = await this.getItineraryByIdPublic(itineraryId);
    return await this.itineraryPdfService.generatePdf(itinerary);
  }

  // Travel metrics calculation will be implemented separately using Google Maps service
}
