```mermaid
---
config:
  theme: redux
  look: classic
---
sequenceDiagram
    participant User
    participant Screen as :CreateItineraryScreen
    participant JourneyController as :JourneyPlannerController
    participant JourneyService as :JourneyPlannerService
    participant UserProfileRepo as :UserProfileRepository
    participant LocationRepo as :LocationRepository
    participant OllamaService as :OllamaService
    participant GoogleMapsService as :GoogleMapsService
    participant Database

    User->>Screen: 1. Request AI itinerary
    activate Screen
    Screen->>JourneyController: 2. POST /journey/ai-powered
    activate JourneyController
    JourneyController->>JourneyService: 3. createAIPoweredJourney()
    activate JourneyService

    JourneyService->>UserProfileRepo: 4. findByAccountId()
    UserProfileRepo->>Database: 5. Query user profile
    activate Database
    Database-->>UserProfileRepo: 6. userProfile
    deactivate Database
    UserProfileRepo-->>JourneyService: 7. userProfile

    JourneyService->>LocationRepo: 8. findNearbyWithTags()
    LocationRepo->>Database: 9. Query nearby locations
    activate Database
    Database-->>LocationRepo: 10. nearbyCandidates[]
    deactivate Database
    LocationRepo-->>JourneyService: 11. nearbyCandidates[]

    JourneyService->>JourneyService: 12. build context

    JourneyService->>OllamaService: 13. generateJourneyWithDBAccess()
    OllamaService->>OllamaService: 14. buildAgentPrompt() & call LLM()

    alt AI calls query_nearby_locations tool
        OllamaService->>LocationRepo: 15. Query locations
        LocationRepo->>Database: 16. Query locations
        activate Database
        Database-->>LocationRepo: 17. locations[]
        deactivate Database
        LocationRepo-->>OllamaService: 18. locations[]
    end

    OllamaService->>OllamaService: 19. parseAIResponse()
    OllamaService-->>JourneyService: 20. AIJourneyResponse

    JourneyService->>JourneyService: 21. processAIResponse()

    JourneyService->>GoogleMapsService: 22. optimizeRouteWithMetrics()
    GoogleMapsService->>GoogleMapsService: 23. Call Google Maps API
    GoogleMapsService-->>JourneyService: 24. route metrics

    JourneyService->>JourneyService: 25. buildFinalResponse()

    JourneyService-->>JourneyController: 26. AIJourneyResponseDto
    deactivate JourneyService
    JourneyController-->>Screen: 27. AIJourneyResponseDto
    deactivate JourneyController
    Screen-->>User: 28. Show itinerary
    deactivate Screen
```

**Figure 19:** Sequence diagram illustrating the flow of AI creating personal itinerary, including user preference analysis, location data gathering, AI agent processing with database access, route optimization, and comprehensive journey response generation.

```mermaid
---
config:
  theme: redux
  look: classic
---
classDiagram
    class JourneyPlannerController {
        +createAIPoweredJourney(dto: CreatePersonalJourneyDto): AIJourneyResponseDto
    }
    class JourneyPlannerService {
        +createAIPoweredJourney(userId: string, dto: CreatePersonalJourneyDto): AIJourneyResponseDto
        -validate(dto: CreatePersonalJourneyDto): void
        -buildContext(userProfile: UserProfileEntity, locations: LocationEntity[]): AIContext
        -processAIResponse(response: AIJourneyResponse): LocationEntity[]
        -buildFinalResponse(locations: LocationEntity[], route: RouteMetrics): AIJourneyResponseDto
    }
    class UserProfileRepository {
        +findByAccountId(accountId: string): UserProfileEntity
    }
    class UserProfileEntity {
        +accountId: string
        +tagScores: TagScore[]
        +preferences: UserPreferences
    }
    class LocationRepository {
        +findByIds(ids: string[]): LocationEntity[]
        +findNearestLocation(lat: number, lng: number, radius: number): LocationEntity
        +findNearbyWithTags(lat: number, lng: number, radius: number, tags: string[]): LocationEntity[]
    }
    class LocationEntity {
        +id: string
        +name: string
        +latitude: number
        +longitude: number
        +description: string
        +tags: LocationTagsEntity[]
    }
    class OllamaService {
        +generateJourneyWithDBAccess(context: AIContext): AIJourneyResponse
        -buildAgentPrompt(context: AIContext): string
        -getSystemPromptWithTools(): string
        -callLLM(prompt: string, tools: Tool[]): LLMResponse
        -parseAIResponse(response: LLMResponse): AIJourneyResponse
    }
    class GoogleMapsService {
        +optimizeRouteWithMetrics(locations: LocationEntity[]): RouteMetrics
        -callGoogleMapsAPI(waypoints: Coordinates[]): DirectionsResponse
    }
    class RouteMetrics {
        +totalDistance: number
        +estimatedDuration: number
        +route: RouteSegment[]
    }
    class AIJourneyResponse {
        +reasoning: string
        +tips: string[]
        +suggestedLocationIds: string[]
        +locationActivities: Map~string, string[]~
    }

    JourneyPlannerController --> JourneyPlannerService
    JourneyPlannerService --> UserProfileRepository
    JourneyPlannerService --> LocationRepository
    JourneyPlannerService --> OllamaService
    JourneyPlannerService --> GoogleMapsService
    UserProfileRepository --> UserProfileEntity
    LocationRepository --> LocationEntity
    OllamaService --> LocationRepository
    GoogleMapsService --> RouteMetrics
    JourneyPlannerService --> AIJourneyResponse
```

**Figure 19.1:** Class diagram showing the relationships between classes involved in the AI-powered itinerary creation flow, including controllers, services, repositories, AI services, and external APIs.
