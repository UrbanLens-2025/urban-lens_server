```mermaid
---
config:
  theme: redux
  look: classic
---
sequenceDiagram
    participant User
    participant Frontend as : Confirm Ticket Usage Screen
    participant EventCreatorController as :EventCreatorController
    participant EventAttendanceManagementService as :EventAttendanceManagementService
    participant EventRepository as :EventRepository
    participant EventAttendanceRepository as :EventAttendanceRepository
    participant Database

    User->>Frontend: 1. Submit confirm ticket usage form
    activate Frontend
    Frontend->>EventCreatorController: 2. POST /creator/events/:eventId/attendance/confirm-usage
    activate EventCreatorController
    EventCreatorController->>EventAttendanceManagementService: 3. confirmTicketUsage()
    activate EventAttendanceManagementService
    EventAttendanceManagementService->>EventRepository: 4. findOneOrFail()
    activate EventRepository
    EventRepository->>Database: 5. Query event by ID and createdById
    activate Database
    Database-->>EventRepository: 6. Return event
    deactivate Database
    EventRepository-->>EventAttendanceManagementService: 7. Return event
    deactivate EventRepository
    EventAttendanceManagementService->>EventAttendanceRepository: 8. findOneOrFail()
    activate EventAttendanceRepository
    EventAttendanceRepository->>Database: 9. Query event attendance by ID and ownerId
    activate Database
    Database-->>EventAttendanceRepository: 10. Return event attendance
    deactivate Database
    EventAttendanceRepository-->>EventAttendanceManagementService: 11. Return event attendance
    deactivate EventAttendanceRepository
    EventAttendanceManagementService->>EventAttendanceManagementService: 12. Validate event can check in
    alt Event cannot check in
        EventAttendanceManagementService-->>EventCreatorController: 13. Return error message
        EventCreatorController-->>Frontend: 14. Return error response
        Frontend-->>User: 15. Show error message
    else Event can check in
        EventAttendanceManagementService->>EventAttendanceManagementService: 16. Validate user's ticket can check in
        alt User's ticket cannot check in
            EventAttendanceManagementService-->>EventCreatorController: 17. Return error message
            EventCreatorController-->>Frontend: 18. Return error response
            Frontend-->>User: 19. Show error message
        else User's ticket can check in
            EventAttendanceManagementService->>EventAttendanceRepository: 20. save()
            activate EventAttendanceRepository
            EventAttendanceRepository->>Database: 21. Update event attendance status
            activate Database
            Database-->>EventAttendanceRepository: 22. Return updated event attendance
            deactivate Database
            EventAttendanceRepository-->>EventAttendanceManagementService: 23. Return updated event attendance
            deactivate EventAttendanceRepository
            EventAttendanceManagementService-->>EventCreatorController: 24. Return success response
            deactivate EventAttendanceManagementService
            EventCreatorController-->>Frontend: 25. Return success response
            deactivate EventCreatorController
            Frontend-->>User: 26. Show success message
            deactivate Frontend
        end
    end
```