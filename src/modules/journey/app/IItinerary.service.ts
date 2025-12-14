import { CreateItineraryDto } from '@/common/dto/journey/CreateItinerary.dto';
import { CreateItineraryFromAIDto } from '@/common/dto/journey/CreateItineraryFromAI.dto';
import { UpdateItineraryDto } from '@/common/dto/journey/UpdateItinerary.dto';
import { FinishItineraryDto } from '@/common/dto/journey/FinishItinerary.dto';
import { ItineraryEntity } from '../domain/Itinerary.entity';

export abstract class IItineraryService {
  abstract createItinerary(
    userId: string,
    dto: CreateItineraryDto,
  ): Promise<ItineraryEntity>;

  abstract createItineraryFromAI(
    userId: string,
    dto: CreateItineraryFromAIDto,
  ): Promise<ItineraryEntity>;

  abstract getItineraryById(
    userId: string,
    itineraryId: string,
  ): Promise<ItineraryEntity>;

  abstract getUserItineraries(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<{ itineraries: ItineraryEntity[]; total: number }>;

  abstract updateItinerary(
    userId: string,
    itineraryId: string,
    dto: UpdateItineraryDto,
  ): Promise<ItineraryEntity>;

  abstract finishItinerary(
    userId: string,
    itineraryId: string,
    dto: FinishItineraryDto,
  ): Promise<ItineraryEntity>;

  abstract deleteItinerary(userId: string, itineraryId: string): Promise<void>;
}
