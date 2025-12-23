```mermaid
---
config:
  theme: redux
  look: classic
---
sequenceDiagram
    participant User
    participant Screen
    participant LocationController as :LocationUserController
    participant CheckInService as :CheckInV2Service
    participant CheckInRepo as :CheckInRepository
    participant LocationRepo as :LocationRepository
    participant UserProfileRepo as :UserProfileRepository
    participant Database

    User->>Screen: 1. Request check-in
    activate Screen
    Screen->>LocationController: 2. POST /user/locations/:locationId/check-in
    activate LocationController
    LocationController->>CheckInService: 3. registerCheckIn()
    activate CheckInService

    CheckInService->>CheckInService: 4. Validate account & location

    CheckInService->>CheckInRepo: 5. exists()
    activate CheckInRepo
    CheckInRepo->>Database: 6. Query check_ins
    activate Database
    Database-->>CheckInRepo: 7. exists result
    deactivate Database
    CheckInRepo-->>CheckInService: 8. exists result
    deactivate CheckInRepo

    CheckInService->>LocationRepo: 9. calculateDistanceTo()
    activate LocationRepo
    LocationRepo->>Database: 10. Calculate distance
    activate Database
    Database-->>LocationRepo: 11. distance
    deactivate Database
    LocationRepo-->>CheckInService: 12. distance
    deactivate LocationRepo

    alt Distance > radiusMeters
        CheckInService-->>LocationController: 13. BadRequestException
        LocationController-->>Screen: 14. Error response
        Screen-->>User: 15. Error message
        deactivate Screen
        deactivate CheckInService
        deactivate LocationController
    else Distance <= radiusMeters
        CheckInService->>CheckInRepo: 13. save()
        activate CheckInRepo
        CheckInRepo->>Database: 14. INSERT check_ins
        activate Database
        Database-->>CheckInRepo: 15. saved
        deactivate Database
        CheckInRepo-->>CheckInService: 16. saved
        deactivate CheckInRepo

        CheckInService->>UserProfileRepo: 17. increment()
        activate UserProfileRepo
        UserProfileRepo->>Database: 18. UPDATE user_profiles
        activate Database
        Database-->>UserProfileRepo: 19. updated
        deactivate Database
        UserProfileRepo-->>CheckInService: 20. updated
        deactivate UserProfileRepo

        CheckInService->>CheckInService: 21. emit(CHECK_IN_CREATED_EVENT)

        CheckInService-->>LocationController: 22. Return response
        deactivate CheckInService
        LocationController-->>Screen: 23. Success response
        deactivate LocationController
        Screen-->>User: 24. Success message
        deactivate Screen
    end
```

**Figure 16:** Sequence diagram illustrating the flow of user check-in to a location, including validation (account setup, location visibility, duplicate check-in), distance verification, check-in creation, and user profile counter updates.
