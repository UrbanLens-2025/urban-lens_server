```mermaid
---
config:
  theme: redux
  look: classic
---
sequenceDiagram
    participant User
    participant LocationCheckInScreen as :LocationCheckInScreen
    participant LocationController as :LocationUserController
    participant CheckInService as :CheckInV2Service
    participant CheckInRepo as :CheckInRepository
    participant LocationRepo as :LocationRepository
    participant AccountRepo as :AccountRepository
    participant UserProfileRepo as :UserProfileRepository
    participant EventEmitter as :EventEmitter
    participant Database

    User->>LocationCheckInScreen: 1. Request check-in
    activate LocationCheckInScreen
    LocationCheckInScreen->>LocationController: 2. POST /user/locations/:locationId/check-in<br/>(RegisterCheckInDto + JWT)
    activate LocationController
    LocationController->>CheckInService: 3. registerCheckIn(dto)
    activate CheckInService

    CheckInService->>AccountRepo: 4. findOneOrFail()<br/>(validate account)
    activate AccountRepo
    AccountRepo->>Database: 5. Query account by ID
    activate Database
    Database-->>AccountRepo: 6. Return account
    deactivate Database
    AccountRepo-->>CheckInService: 7. Return account
    deactivate AccountRepo

    CheckInService->>CheckInService: 8. validate account.canPerformActions()

    CheckInService->>LocationRepo: 9. findOneByOrFail()<br/>(validate location)
    activate LocationRepo
    LocationRepo->>Database: 10. Query location by ID
    activate Database
    Database-->>LocationRepo: 11. Return location
    deactivate Database
    LocationRepo-->>CheckInService: 12. Return location
    deactivate LocationRepo

    CheckInService->>CheckInService: 13. validate location.canBeViewedOnMap()

    CheckInService->>CheckInRepo: 14. exists()<br/>(check duplicate check-in)
    activate CheckInRepo
    CheckInRepo->>Database: 15. Query check_ins
    activate Database
    Database-->>CheckInRepo: 16. Return exists result
    deactivate Database
    CheckInRepo-->>CheckInService: 17. Return exists result
    deactivate CheckInRepo

    CheckInService->>LocationRepo: 18. calculateDistanceTo()<br/>(currentLocation, locationCoordinates)
    activate LocationRepo
    LocationRepo->>Database: 19. Calculate distance using PostGIS
    activate Database
    Database-->>LocationRepo: 20. Return distance
    deactivate Database
    LocationRepo-->>CheckInService: 21. Return distance
    deactivate LocationRepo

    alt Distance > location.radiusMeters
        CheckInService-->>LocationController: 22. Return BadRequestException<br/>("Not in acceptable range")
        LocationController-->>LocationCheckInScreen: 23. Return 400 Bad Request
        LocationCheckInScreen-->>User: 24. Show error message
    else Distance <= location.radiusMeters
        CheckInService->>CheckInRepo: 25. save(checkInEntity)
        activate CheckInRepo
        CheckInRepo->>Database: 26. INSERT INTO check_ins
        activate Database
        Database-->>CheckInRepo: 27. Return saved check-in
        deactivate Database
        CheckInRepo-->>CheckInService: 28. Return saved check-in
        deactivate CheckInRepo

        CheckInService->>UserProfileRepo: 29. increment()<br/>SET totalCheckIns = totalCheckIns + 1
        activate UserProfileRepo
        UserProfileRepo->>Database: 30. UPDATE user_profiles
        activate Database
        Database-->>UserProfileRepo: 31. Return updated
        deactivate Database
        UserProfileRepo-->>CheckInService: 32. Return updated
        deactivate UserProfileRepo

        CheckInService->>EventEmitter: 33. emit(CHECK_IN_CREATED_EVENT)
        activate EventEmitter
        EventEmitter-->>CheckInService: 34. Event emitted
        deactivate EventEmitter

        CheckInService->>CheckInService: 35. mapTo(CheckInResponseDto)
        CheckInService-->>LocationController: 36. Return CheckInResponseDto
        deactivate CheckInService
        LocationController-->>LocationCheckInScreen: 37. Return CheckInResponseDto
        deactivate LocationController
        LocationCheckInScreen-->>User: 38. Show success message
        deactivate LocationCheckInScreen
    end
```

**Figure 16:** Sequence diagram illustrating the flow of user check-in to a location, including validation (account setup, location visibility, duplicate check-in), distance verification, check-in creation, and user profile counter updates.
