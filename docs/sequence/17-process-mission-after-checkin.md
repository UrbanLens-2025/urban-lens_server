```mermaid
---
config:
  theme: redux
  look: classic
---
sequenceDiagram
    participant CheckInService as :CheckInV2Service
    participant EventEmitter
    participant CheckInListener as :CheckInCreatedListener
    participant PointsService as :UserPointsService
    participant UserLocationProfileService as :UserLocationProfileService
    participant MissionService as :MissionProgressService
    participant Database


    CheckInService->>EventEmitter: 1. emit(CHECK_IN_CREATED_EVENT)<br/>(userId, locationId, checkInId)
    activate EventEmitter
    EventEmitter->>CheckInListener: 2. CHECK_IN_CREATED_EVENT
    deactivate EventEmitter
    activate CheckInListener

    CheckInListener->>Database: 3. Query reward_points<br/>(type='CHECK_IN')
    Database-->>CheckInListener: rewardPoint

    CheckInListener->>PointsService: 4. addPoints(type: CHECK_IN)
    PointsService->>Database: INSERT INTO points_history
    Database-->>PointsService: success
    PointsService-->>CheckInListener: success

    CheckInListener->>UserLocationProfileService: 5. createOrUpdate(userId, locationId)
    UserLocationProfileService->>Database: INSERT/UPDATE user_location_profiles
    Database-->>UserLocationProfileService: profile
    UserLocationProfileService-->>CheckInListener: profile


    CheckInListener->>MissionService: 6. updateMissionProgress(userId, locationId, checkInId)
    activate MissionService

    MissionService->>Database: 7. Query active missions<br/>(locationId, startDate <= now <= endDate)
    Database-->>MissionService: missions[]

    loop For each active mission
        MissionService->>Database: 8. Query/Create progress<br/>(userId, missionId)
        Database-->>MissionService: userProgress

        alt Progress exists & not completed
            MissionService->>Database: 9. UPDATE progress = progress + 1

            alt Mission completed (progress >= target)
                MissionService->>Database: 10. UPDATE completed = true
                MissionService->>Database: 11. INSERT INTO points_history<br/>(type: LOCATION_MISSION)
            end
        end
    end

    MissionService-->>CheckInListener: Processing complete
    deactivate MissionService
    CheckInListener-->>CheckInService: Event handled
    deactivate CheckInListener
```

**Figure 17:** Sequence diagram illustrating the flow of processing users' missions automatically after check-in, including points awarding for check-in, user location profile creation, and mission progress tracking with completion rewards.
