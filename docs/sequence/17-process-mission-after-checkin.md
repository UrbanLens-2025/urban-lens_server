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
    participant RewardPointsRepo as :RewardPointsRepository
    participant PointsHistoryRepo as :PointsHistoryRepository
    participant UserLocationProfileRepo as :UserLocationProfileRepository
    participant MissionRepo as :LocationMissionRepository
    participant ProgressRepo as :UserMissionProgressRepository
    participant Database


    CheckInService->>EventEmitter: 1. emit(CHECK_IN_CREATED_EVENT)<br/>(userId, locationId, checkInId)
    activate EventEmitter
    EventEmitter->>CheckInListener: 2. CHECK_IN_CREATED_EVENT
    deactivate EventEmitter
    activate CheckInListener

    CheckInListener->>RewardPointsRepo: 3. findOne()<br/>WHERE type = 'CHECK_IN'
    activate RewardPointsRepo
    RewardPointsRepo->>Database: 4. Query reward_points
    activate Database
    Database-->>RewardPointsRepo: 5. Return rewardPoint
    deactivate Database
    RewardPointsRepo-->>CheckInListener: 6. Return rewardPoint
    deactivate RewardPointsRepo

    CheckInListener->>PointsService: 7. addPoints()<br/>type: CHECK_IN
    activate PointsService
    PointsService->>PointsHistoryRepo: 8. save()<br/>INSERT INTO points_history
    activate PointsHistoryRepo
    PointsHistoryRepo->>Database: 9. INSERT INTO points_history
    activate Database
    Database-->>PointsHistoryRepo: 10. Return created
    deactivate Database
    PointsHistoryRepo-->>PointsService: 11. Return created
    deactivate PointsHistoryRepo
    PointsService-->>CheckInListener: 12. Return success
    deactivate PointsService

    CheckInListener->>UserLocationProfileService: 13. createOrUpdate()<br/>(userId, locationId)
    activate UserLocationProfileService
    UserLocationProfileService->>UserLocationProfileRepo: 14. save()<br/>INSERT/UPDATE user_location_profiles
    activate UserLocationProfileRepo
    UserLocationProfileRepo->>Database: 15. INSERT/UPDATE user_location_profiles
    activate Database
    Database-->>UserLocationProfileRepo: 16. Return created/updated
    deactivate Database
    UserLocationProfileRepo-->>UserLocationProfileService: 17. Return profile
    deactivate UserLocationProfileRepo
    UserLocationProfileService-->>CheckInListener: 18. Return profile
    deactivate UserLocationProfileService


    CheckInListener->>MissionService: 19. updateMissionProgress(userId,<br/>locationId, checkInId)
    activate MissionService

    MissionService->>MissionRepo: 20. find()<br/>WHERE locationId AND startDate <= now <= endDate
    activate MissionRepo
    MissionRepo->>Database: 21. Query active_missions
    activate Database
    Database-->>MissionRepo: 22. Return missions[]
    deactivate Database
    MissionRepo-->>MissionService: 23. Return missions[]
    deactivate MissionRepo

    loop For each active mission
        MissionService->>ProgressRepo: 24. findOne()<br/>WHERE userId AND missionId
        activate ProgressRepo
        ProgressRepo->>Database: 25. Query user_mission_progress
        activate Database
        Database-->>ProgressRepo: 26. Return userProgress (or null)
        deactivate Database
        ProgressRepo-->>MissionService: 27. Return userProgress
        deactivate ProgressRepo

        alt No progress exists
            MissionService->>ProgressRepo: 28. save()<br/>INSERT INTO user_mission_progress<br/>(progress: 0)
            activate ProgressRepo
            ProgressRepo->>Database: 29. INSERT INTO user_mission_progress
            activate Database
            Database-->>ProgressRepo: 30. Return created
            deactivate Database
            ProgressRepo-->>MissionService: 31. Return created
            deactivate ProgressRepo
        end

        alt Mission not completed
            MissionService->>ProgressRepo: 32. save()<br/>UPDATE progress = progress + 1
            activate ProgressRepo
            ProgressRepo->>Database: 33. UPDATE user_mission_progress
            activate Database
            Database-->>ProgressRepo: 34. Return updated
            deactivate Database
            ProgressRepo-->>MissionService: 35. Return updated
            deactivate ProgressRepo

            alt Mission completed (progress >= target)
                MissionService->>ProgressRepo: 36. save()<br/>UPDATE completed = true
                activate ProgressRepo
                ProgressRepo->>Database: 37. UPDATE user_mission_progress
                activate Database
                Database-->>ProgressRepo: 38. Return updated
                deactivate Database
                ProgressRepo-->>MissionService: 39. Return updated
                deactivate ProgressRepo

                MissionService->>PointsService: 40. addPoints()<br/>type: LOCATION_MISSION
                activate PointsService
                PointsService->>PointsHistoryRepo: 41. save()<br/>INSERT INTO points_history
                activate PointsHistoryRepo
                PointsHistoryRepo->>Database: 42. INSERT INTO points_history
                activate Database
                Database-->>PointsHistoryRepo: 43. Return created
                deactivate Database
                PointsHistoryRepo-->>PointsService: 44. Return created
                deactivate PointsHistoryRepo
                PointsService-->>MissionService: 45. Return success
                deactivate PointsService
            end
        end
    end

    MissionService-->>CheckInListener: 46. Processing complete
    deactivate MissionService
    CheckInListener-->>CheckInService: 47. Event handled
    deactivate CheckInListener
```

**Figure 17:** Sequence diagram illustrating the flow of processing users' missions automatically after check-in, including points awarding for check-in, user location profile creation, and mission progress tracking with completion rewards.
