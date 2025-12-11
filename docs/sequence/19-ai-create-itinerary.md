```mermaid
---
config:
  theme: redux
  look: classic
---
sequenceDiagram
    participant User
    participant AIItineraryScreen as :AIItineraryScreen
    participant JourneyController as :JourneyPlannerController
    participant JourneyService as :JourneyPlannerService
    participant UserProfileRepo as :UserProfileRepository
    participant LocationRepo as :LocationRepository
    participant OllamaService as :OllamaService
    participant GoogleMapsService as :GoogleMapsService
    participant Database

    User->>AIItineraryScreen: 1. Request AI itinerary
    activate AIItineraryScreen
    AIItineraryScreen->>JourneyController: 2. POST /journey/ai-powered<br/>(CreatePersonalJourneyDto + JWT)
    activate JourneyController
    JourneyController->>JourneyService: 3. createAIPoweredJourney(userId, dto)
    activate JourneyService

    JourneyService->>JourneyService: 4. validate(dto)<br/>Check OLLAMA_ENABLED

    JourneyService->>UserProfileRepo: 5. findByAccountId(userId)
    activate UserProfileRepo
    UserProfileRepo->>Database: 6. Query user_profile
    activate Database
    Database-->>UserProfileRepo: 7. Return userProfile
    deactivate Database
    UserProfileRepo-->>JourneyService: 8. Return userProfile
    deactivate UserProfileRepo

    alt startLocationId provided
        JourneyService->>LocationRepo: 9. findByIds([startLocationId])
        activate LocationRepo
        LocationRepo->>Database: 10. Query locations
        activate Database
        Database-->>LocationRepo: 11. Return locations[]
        deactivate Database
        LocationRepo-->>JourneyService: 12. Return startLocation
        deactivate LocationRepo
    else currentLatitude/Longitude provided
        JourneyService->>LocationRepo: 13. findNearestLocation()<br/>(within 50km)
        activate LocationRepo
        LocationRepo->>Database: 14. Query nearest location
        activate Database
        Database-->>LocationRepo: 15. Return nearest location
        deactivate Database
        LocationRepo-->>JourneyService: 16. Return startLocation
        deactivate LocationRepo
    end

    JourneyService->>LocationRepo: 17. findNearbyWithTags()<br/>(within radius, with tags)
    activate LocationRepo
    LocationRepo->>Database: 18. Query nearby locations WITH tags
    activate Database
    Database-->>LocationRepo: 19. Return nearbyCandidates[]
    deactivate Database
    LocationRepo-->>JourneyService: 20. Return nearbyCandidates[]
    deactivate LocationRepo

    JourneyService->>JourneyService: 21. build context<br/>(userPreferences, currentLocation,<br/>numberOfLocations, candidates)

    JourneyService->>OllamaService: 22. generateJourneyWithDBAccess(context)
    activate OllamaService


    OllamaService->>OllamaService: 23. buildAgentPrompt(context)<br/>getSystemPromptWithTools()

    OllamaService->>OllamaService: 24. call LLM<br/>(with database tools)

    alt AI calls query_nearby_locations tool
        OllamaService->>LocationRepo: 25. Query locations<br/>via AI tool call
        activate LocationRepo
        LocationRepo->>Database: 26. Query locations WHERE conditions
        activate Database
        Database-->>LocationRepo: 27. Return locations[]
        deactivate Database
        LocationRepo-->>OllamaService: 28. Return locations[]
        deactivate LocationRepo
    end

    OllamaService->>OllamaService: 29. parseAIResponse()<br/>(REASONING, TIPS, LOCATION_IDS, ACTIVITIES)

    OllamaService-->>JourneyService: 30. Return AIJourneyResponse<br/>{reasoning, tips, suggestedLocationIds,<br/>locationActivities}
    deactivate OllamaService

    JourneyService->>JourneyService: 31. processAIResponse()<br/>(filter, prioritize)

    JourneyService->>GoogleMapsService: 32. optimizeRouteWithMetrics()<br/>(calculate travel times, distances)
    activate GoogleMapsService
    GoogleMapsService->>GoogleMapsService: 33. Call Google Maps API<br/>(directions, distance matrix)
    GoogleMapsService-->>JourneyService: 34. Return route metrics
    deactivate GoogleMapsService

    JourneyService->>JourneyService: 35. buildFinalResponse()<br/>(locations, route, AI insights)

    JourneyService-->>JourneyController: 36. Return AIJourneyResponseDto<br/>{locations, route, totalDistance,<br/>estimatedDuration, reasoning, tips}
    deactivate JourneyService
    JourneyController-->>AIItineraryScreen: 37. Return AIJourneyResponseDto
    deactivate JourneyController
    AIItineraryScreen-->>User: 38. Show itinerary
    deactivate AIItineraryScreen
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
