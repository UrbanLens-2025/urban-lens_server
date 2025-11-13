import { CreatePersonalJourneyDto } from 'src/common/dto/journey/CreatePersonalJourney.dto';
import { PersonalJourneyResponseDto } from 'src/common/dto/journey/PersonalJourneyResponse.dto';
import { AIJourneyResponseDto } from 'src/common/dto/journey/AIJourneyResponse.dto';

export interface IJourneyPlannerService {
  /**
   * Create a personalized journey based on user preferences and constraints
   * Uses algorithmic approach with optional AI insights
   */
  createPersonalJourney(
    userId: string,
    dto: CreatePersonalJourneyDto,
  ): Promise<PersonalJourneyResponseDto>;

  /**
   * Create an AI-powered journey where AI queries database and plans route
   * Requires OLLAMA_ENABLED=true
   */
  createAIPoweredJourney(
    userId: string,
    dto: CreatePersonalJourneyDto,
  ): Promise<AIJourneyResponseDto>;
}

export const IJourneyPlannerService = Symbol('IJourneyPlannerService');
