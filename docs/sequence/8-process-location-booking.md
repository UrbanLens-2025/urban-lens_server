```mermaid
---
config:
  theme: redux
  look: classic
---
sequenceDiagram
    participant User
    participant LocationBookingManagementScreen as : Location Booking Management Screen
    participant LocationBookingOwnerController as : LocationBookingOwnerController
    participant LocationBookingManagementService as : LocationBookingManagementService
    participant LocationBookingRepository as : LocationBookingRepository
    participant Database

    User->>LocationBookingManagementScreen: 1. Submit process booking form
    activate LocationBookingManagementScreen
    LocationBookingManagementScreen->>LocationBookingOwnerController: 2. POST /owner/location-bookings/process/:locationBookingId
    activate LocationBookingOwnerController
    LocationBookingOwnerController->>LocationBookingManagementService: 3. processBooking()
    activate LocationBookingManagementService
    LocationBookingManagementService->>LocationBookingRepository: 4. findOneOrFail()
    activate LocationBookingRepository
    LocationBookingRepository->>Database: 5. Query location booking by ID and businessId
    activate Database
    Database-->>LocationBookingRepository: 6. Return location booking
    deactivate Database
    LocationBookingRepository-->>LocationBookingManagementService: 7. Return location booking
    deactivate LocationBookingRepository
    LocationBookingManagementService->>LocationBookingManagementService: 8. Validate booking can be processed
    alt Booking cannot be processed
        LocationBookingManagementService-->>LocationBookingOwnerController: 9. Return error message
        LocationBookingOwnerController-->>LocationBookingManagementScreen: 10. Return error response
        LocationBookingManagementScreen-->>User: 11. Show error message
    else Booking can be processed
        LocationBookingManagementService->>LocationBookingRepository: 12. update()
        activate LocationBookingRepository
        LocationBookingRepository->>Database: 13. Update booking status and softLockedUntil
        activate Database
        Database-->>LocationBookingRepository: 14. Return update result
        deactivate Database
        LocationBookingRepository-->>LocationBookingManagementService: 15. Return update result
        deactivate LocationBookingRepository
        LocationBookingManagementService-->>LocationBookingOwnerController: 16. Return success response
        deactivate LocationBookingManagementService
        LocationBookingOwnerController-->>LocationBookingManagementScreen: 17. Return success response
        deactivate LocationBookingOwnerController
        LocationBookingManagementScreen-->>User: 18. Show success message
        deactivate LocationBookingManagementScreen
    end
```
