```mermaid
---
config:
  theme: redux
  look: classic
---
sequenceDiagram
    participant User
    participant CreateMissionScreen as :CreateMissionScreen
    participant MissionController as :LocationMissionBusinessController
    participant MissionService as :LocationMissionService
    participant MissionRepo as :LocationMissionRepository
    participant LocationRepo as :LocationRepository
    participant Database

    User->>CreateMissionScreen: 1. Submit mission creation form
    activate CreateMissionScreen
    CreateMissionScreen->>MissionController: 2. POST /business/location-mission/:locationId<br/>(CreateLocationMissionDto + JWT)
    activate MissionController
    MissionController->>MissionService: 3. createMission(locationId, dto)
    activate MissionService

    MissionService->>LocationRepo: 4. findOneByOrFail()<br/>(validate location)
    activate LocationRepo
    LocationRepo->>Database: 5. Query location by ID
    activate Database
    Database-->>LocationRepo: 6. Return location
    deactivate Database
    LocationRepo-->>MissionService: 7. Return location
    deactivate LocationRepo

    MissionService->>MissionService: 8. validate(dto)<br/>(date range, target, reward)

    alt Validation failed
        MissionService-->>MissionController: 9. Return BadRequestException
        MissionController-->>CreateMissionScreen: 10. Return 400 Bad Request
        CreateMissionScreen-->>User: 11. Show error message
    else Validation passed
        MissionService->>MissionRepo: 12. save(missionEntity)
        activate MissionRepo
        MissionRepo->>Database: 13. INSERT INTO location_missions
        activate Database
        Database-->>MissionRepo: 14. Return saved mission
        deactivate Database
        MissionRepo-->>MissionService: 15. Return saved mission
        deactivate MissionRepo

        MissionService->>MissionService: 16. map to LocationMissionResponseDto
        MissionService-->>MissionController: 17. Return LocationMissionResponseDto
        deactivate MissionService
        MissionController-->>CreateMissionScreen: 18. Return LocationMissionResponseDto
        deactivate MissionController
        CreateMissionScreen-->>User: 19. Show success message
        deactivate CreateMissionScreen
    end
```

**Figure 14:** Sequence diagram illustrating the flow of creating a location mission by a business owner, including location existence verification, date range validation, and mission creation.
