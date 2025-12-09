```mermaid
---
config:
  theme: redux
  look: classic
---
sequenceDiagram
    participant User
    participant Frontend as : Location Request Detail Screen
    participant LocationRequestAdminController as : LocationRequestAdminController
    participant LocationRequestManagementService as : LocationRequestManagementService
    participant LocationRequestRepository as : LocationRequestRepository
    participant LocationManagementService as : LocationManagementService
    participant LocationRepository as : LocationRepository
    participant LocationRequestTagsRepository as : LocationRequestTagsRepository
    participant LocationTagsRepository as : LocationTagsRepository
    participant LocationBookingConfigManagementService as : LocationBookingConfigManagementService
    participant EventEmitter as : EventEmitter
    participant Database

    User->>Frontend: 1. Submit process location request form
    activate Frontend
    Frontend->>LocationRequestAdminController: 2. POST /admin/location-request/process/:locationRequestId
    activate LocationRequestAdminController
    LocationRequestAdminController->>LocationRequestManagementService: 3. processLocationRequest()
    activate LocationRequestManagementService
    LocationRequestManagementService->>LocationRequestRepository: 4. findOneByOrFail()
    activate LocationRequestRepository
    LocationRequestRepository->>Database: 5. Query location request by ID
    activate Database
    Database-->>LocationRequestRepository: 6. Return location request
    deactivate Database
    LocationRequestRepository-->>LocationRequestManagementService: 7. Return location request
    deactivate LocationRequestRepository
    LocationRequestManagementService->>LocationRequestManagementService: 8. Validate location request can be processed
    alt Location request cannot be processed
        LocationRequestManagementService-->>LocationRequestAdminController: 9. Return error message
        LocationRequestAdminController-->>Frontend: 10. Return error response
        Frontend-->>User: 11. Show error message
    else Location request can be processed
        LocationRequestManagementService->>LocationRequestRepository: 12. update()
        activate LocationRequestRepository
        LocationRequestRepository->>Database: 13. Update location request status
        activate Database
        Database-->>LocationRequestRepository: 14. Return update result
        deactivate Database
        LocationRequestRepository-->>LocationRequestManagementService: 15. Return update result
        deactivate LocationRequestRepository
        alt Status is APPROVED
            LocationRequestManagementService->>LocationManagementService: 16. convertLocationRequestToLocationEntity()
            activate LocationManagementService
            LocationManagementService->>LocationRepository: 17. save()
            activate LocationRepository
            LocationRepository->>Database: 18. Insert location
            activate Database
            Database-->>LocationRepository: 19. Return location
            deactivate Database
            LocationRepository-->>LocationManagementService: 20. Return location
            deactivate LocationRepository
            LocationManagementService->>LocationRequestTagsRepository: 21. find()
            activate LocationRequestTagsRepository
            LocationRequestTagsRepository->>Database: 22. Query location request tags
            activate Database
            Database-->>LocationRequestTagsRepository: 23. Return location request tags
            deactivate Database
            LocationRequestTagsRepository-->>LocationManagementService: 24. Return location request tags
            deactivate LocationRequestTagsRepository
            LocationManagementService->>LocationTagsRepository: 25. persistEntities()
            activate LocationTagsRepository
            LocationTagsRepository->>Database: 26. Insert location tags
            activate Database
            Database-->>LocationTagsRepository: 27. Return location tags
            deactivate Database
            LocationTagsRepository-->>LocationManagementService: 28. Return location tags
            deactivate LocationTagsRepository
            LocationManagementService->>LocationBookingConfigManagementService: 29. createDefaultLocationBookingConfig()
            activate LocationBookingConfigManagementService
            LocationBookingConfigManagementService->>Database: 30. Insert location booking config
            activate Database
            Database-->>LocationBookingConfigManagementService: 31. Return location booking config
            deactivate Database
            LocationBookingConfigManagementService-->>LocationManagementService: 32. Return location booking config
            deactivate LocationBookingConfigManagementService
            LocationManagementService-->>LocationRequestManagementService: 33. Return location
            deactivate LocationManagementService
        end
        LocationRequestManagementService->>EventEmitter: 34. emit event
        activate EventEmitter
        EventEmitter-->>LocationRequestManagementService: 35. Event emitted
        deactivate EventEmitter
        LocationRequestManagementService-->>LocationRequestAdminController: 36. Return success response
        deactivate LocationRequestManagementService
        LocationRequestAdminController-->>Frontend: 37. Return success response
        deactivate LocationRequestAdminController
        Frontend-->>User: 38. Show success message
        deactivate Frontend
    end
```

