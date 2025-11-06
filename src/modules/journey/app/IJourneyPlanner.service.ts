import { CreatePersonalJourneyDto } from 'src/common/dto/journey/CreatePersonalJourney.dto';
import { PersonalJourneyResponseDto } from 'src/common/dto/journey/PersonalJourneyResponse.dto';

export interface IJourneyPlannerService {
  /**
   * Create a personalized journey based on user preferences and constraints
   */
  createPersonalJourney(
    userId: string,
    dto: CreatePersonalJourneyDto,
  ): Promise<PersonalJourneyResponseDto>;
}

export const IJourneyPlannerService = Symbol('IJourneyPlannerService');
