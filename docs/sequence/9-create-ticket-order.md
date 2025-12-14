```mermaid
---
config:
  theme: redux
  look: classic
---
sequenceDiagram
    participant User
    participant TicketPurchaseScreen as :TicketPurchaseScreen
    participant EventUserController as :EventUserController
    participant TicketOrderManagementService as :TicketOrderManagementService
    participant EventAttendanceManagementService as :EventAttendanceManagementService
    participant WalletTransactionCoordinatorService as :WalletTransactionCoordinatorService
    participant WalletTransactionManagementService as :WalletTransactionManagementService
    participant WalletActionService as :WalletActionService
    participant EventRepository as :EventRepository
    participant EventTicketRepository as :EventTicketRepository
    participant WalletTransactionRepository as :WalletTransactionRepository
    participant WalletRepository as :WalletRepository
    participant TicketOrderRepository as :TicketOrderRepository
    participant AccountRepository as :AccountRepository
    participant EventAttendanceRepository as :EventAttendanceRepository
    participant Database

    User->>TicketPurchaseScreen: 1. Submit create ticket order form
    activate TicketPurchaseScreen
    TicketPurchaseScreen->>EventUserController: 2. POST /user/event/:eventId/create-order
    activate EventUserController
    EventUserController->>TicketOrderManagementService: 3. createOrder()
    activate TicketOrderManagementService
    TicketOrderManagementService->>EventRepository: 4. findOneOrFail()
    activate EventRepository
    EventRepository->>Database: 5. Query event by ID
    activate Database
    Database-->>EventRepository: 6. Return event
    deactivate Database
    EventRepository-->>TicketOrderManagementService: 7. Return event
    deactivate EventRepository
    TicketOrderManagementService->>EventTicketRepository: 8. find()
    activate EventTicketRepository
    EventTicketRepository->>Database: 9. Query event tickets by IDs
    activate Database
    Database-->>EventTicketRepository: 10. Return event tickets
    deactivate Database
    EventTicketRepository-->>TicketOrderManagementService: 11. Return event tickets
    deactivate EventTicketRepository
    TicketOrderManagementService->>TicketOrderManagementService: 12. Validate ticket purchaseability and quantity
    alt Ticket validation fails
        TicketOrderManagementService-->>EventUserController: 13. Return error message
        EventUserController-->>TicketPurchaseScreen: 14. Return error response
        TicketPurchaseScreen-->>User: 15. Show error message
    else Ticket validation succeeds
        TicketOrderManagementService->>WalletTransactionCoordinatorService: 16. coordinateTransferToEscrow()
        activate WalletTransactionCoordinatorService
        WalletTransactionCoordinatorService->>WalletTransactionManagementService: 17. transferFundsFromUserWallet()
        activate WalletTransactionManagementService        
        WalletTransactionManagementService->>WalletTransactionRepository: 18. save()
        activate WalletTransactionRepository
        WalletTransactionRepository->>Database: 19. Insert wallet transaction
        activate Database
        Database-->>WalletTransactionRepository: 20. Return wallet transaction
        deactivate Database
        WalletTransactionRepository-->>WalletTransactionManagementService: 21. Return wallet transaction
        deactivate WalletTransactionRepository
        WalletTransactionManagementService->>WalletActionService: 22. withdrawFunds()
        activate WalletActionService
        WalletActionService->>WalletActionService: 23. Verify wallet balance is sufficient
        alt Wallet balance insufficient
            WalletActionService-->>WalletTransactionManagementService: 24. Return error message
            WalletTransactionManagementService-->>TicketOrderManagementService: 25. Return error message
            TicketOrderManagementService-->>EventUserController: 26. Return error message
            EventUserController-->>TicketPurchaseScreen: 27. Return error response
            TicketPurchaseScreen-->>User: 28. Show error message
        else Wallet balance sufficient
            WalletActionService->>WalletRepository: 29. decrementBalance()
            activate WalletRepository
            WalletRepository->>Database: 30. Update source wallet balance
            activate Database
            Database-->>WalletRepository: 31. Return update result
            deactivate Database
            WalletRepository-->>WalletActionService: 32. Return update result
            deactivate WalletRepository
            WalletActionService-->>WalletTransactionManagementService: 33. Return success
            deactivate WalletActionService
            WalletTransactionManagementService->>WalletActionService: 34. depositFunds()
            activate WalletActionService
            WalletActionService->>WalletRepository: 35. incrementBalance()
            activate WalletRepository
            WalletRepository->>Database: 36. Update destination wallet balance
            activate Database
            Database-->>WalletRepository: 37. Return update result
            deactivate Database
            WalletRepository-->>WalletActionService: 38. Return update result
            deactivate WalletRepository
            WalletActionService-->>WalletTransactionManagementService: 39. Return success
            deactivate WalletActionService
            WalletTransactionManagementService->>WalletTransactionRepository: 40. update()
            activate WalletTransactionRepository
            WalletTransactionRepository->>Database: 41. Update transaction status
            activate Database
            Database-->>WalletTransactionRepository: 42. Return update result
            deactivate Database
            WalletTransactionRepository-->>WalletTransactionManagementService: 43. Return update result
            deactivate WalletTransactionRepository
            WalletTransactionManagementService-->>WalletTransactionCoordinatorService: 44. Return wallet transaction
            deactivate WalletTransactionManagementService
            WalletTransactionCoordinatorService-->>TicketOrderManagementService: 45. Return wallet transaction
            deactivate WalletTransactionCoordinatorService
            TicketOrderManagementService->>TicketOrderRepository: 46. save()
            activate TicketOrderRepository
            TicketOrderRepository->>Database: 47. Insert ticket order and details
            activate Database
            Database-->>TicketOrderRepository: 48. Return ticket order
            deactivate Database
            TicketOrderRepository-->>TicketOrderManagementService: 49. Return ticket order
            deactivate TicketOrderRepository
            TicketOrderManagementService->>EventTicketRepository: 50. reserveTickets()
            activate EventTicketRepository
            EventTicketRepository->>Database: 51. Update ticket quantities
            activate Database
            Database-->>EventTicketRepository: 52. Return updated tickets
            deactivate Database
            EventTicketRepository-->>TicketOrderManagementService: 53. Return updated tickets
            deactivate EventTicketRepository
            TicketOrderManagementService-->>EventUserController: 64. Return success response
            deactivate TicketOrderManagementService
            EventUserController-->>TicketPurchaseScreen: 65. Return success response
            deactivate EventUserController
            TicketPurchaseScreen-->>User: 66. Show success message
            deactivate TicketPurchaseScreen
        end
    end
```
