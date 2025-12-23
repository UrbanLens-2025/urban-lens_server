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
    participant PointsHistoryRepo as :PointsHistoryRepository
    participant UserProfileRepo as :UserProfileRepository
    participant UserLocationProfileService as :UserLocationProfileService
    participant UserLocationProfileRepo as :UserLocationProfileRepository
    participant MissionService as :MissionProgressService
    participant LocationMissionRepo as :LocationMissionRepository
    participant UserMissionProgressRepo as :UserMissionProgressRepository
    participant Database

    CheckInService->>EventEmitter: 1. emit(CHECK_IN_CREATED_EVENT)
    activate EventEmitter
    EventEmitter->>CheckInListener: 2. CHECK_IN_CREATED_EVENT
    deactivate EventEmitter
    activate CheckInListener

    CheckInListener->>PointsService: 3. addPoints()
    activate PointsService
    PointsService->>UserProfileRepo: 4. findOne()
    activate UserProfileRepo
    UserProfileRepo->>Database: 5. Query user_profiles
    activate Database
    Database-->>UserProfileRepo: 6. userProfile
    deactivate Database
    UserProfileRepo-->>PointsService: 7. userProfile
    deactivate UserProfileRepo

    PointsService->>UserProfileRepo: 8. save()
    UserProfileRepo->>Database: 9. UPDATE user_profiles
    activate Database
    Database-->>UserProfileRepo: 10. updated
    deactivate Database
    UserProfileRepo-->>PointsService: 11. updated

    PointsService->>PointsHistoryRepo: 12. create() & save()
    activate PointsHistoryRepo
    PointsHistoryRepo->>Database: 13. INSERT points_history
    activate Database
    Database-->>PointsHistoryRepo: 14. saved
    deactivate Database
    PointsHistoryRepo-->>PointsService: 15. saved
    deactivate PointsHistoryRepo
    PointsService-->>CheckInListener: 16. success
    deactivate PointsService

    CheckInListener->>UserLocationProfileService: 17. createOrUpdate()
    activate UserLocationProfileService
    UserLocationProfileService->>UserLocationProfileRepo: 18. createOrUpdate()
    activate UserLocationProfileRepo
    UserLocationProfileRepo->>Database: 19. INSERT/UPDATE user_location_profiles
    activate Database
    Database-->>UserLocationProfileRepo: 20. profile
    deactivate Database
    UserLocationProfileRepo-->>UserLocationProfileService: 21. profile
    deactivate UserLocationProfileRepo
    UserLocationProfileService-->>CheckInListener: 22. profile
    deactivate UserLocationProfileService

    CheckInListener->>MissionService: 23. updateMissionProgress()
    activate MissionService
    MissionService->>LocationMissionRepo: 24. createQueryBuilder()
    activate LocationMissionRepo
    LocationMissionRepo->>Database: 25. Query location_missions
    activate Database
    Database-->>LocationMissionRepo: 26. missions[]
    deactivate Database
    LocationMissionRepo-->>MissionService: 27. missions[]
    deactivate LocationMissionRepo

    MissionService->>UserMissionProgressRepo: 28. findOne() & save()
    activate UserMissionProgressRepo
    UserMissionProgressRepo->>Database: 29. Query/Create/UPDATE user_mission_progresses
    activate Database
    Database-->>UserMissionProgressRepo: 30. Result
    deactivate Database
    UserMissionProgressRepo-->>MissionService: 31. Result
    deactivate UserMissionProgressRepo

    MissionService-->>CheckInListener: 32. Processing complete
    deactivate MissionService

    CheckInListener-->>CheckInService: 33. Event handled
    deactivate CheckInListener
```

**Figure 17:** Sequence diagram illustrating the flow of processing users' missions automatically after check-in, including points awarding for check-in, user location profile creation, and mission progress tracking with completion rewards.
