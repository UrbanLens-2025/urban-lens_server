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
    participant EventRepository as :EventRepository
    participant EventTicketRepository as :EventTicketRepository
    participant WalletTransactionCoordinatorService as :WalletTransactionCoordinatorService
    participant WalletTransactionManagementService as :WalletTransactionManagementService
    participant WalletActionService as :WalletActionService
    participant WalletTransactionRepository as :WalletTransactionRepository
    participant WalletRepository as :WalletRepository
    participant TicketOrderRepository as :TicketOrderRepository
    participant EventAttendanceManagementService as :EventAttendanceManagementService
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
    TicketOrderManagementService->>EventTicketRepository: 12. find()
    activate EventTicketRepository
    EventTicketRepository->>Database: 13. Query event tickets by IDs
    activate Database
    Database-->>EventTicketRepository: 14. Return event tickets
    deactivate Database
    EventTicketRepository-->>TicketOrderManagementService: 15. Return event tickets
    deactivate EventTicketRepository
    TicketOrderManagementService->>TicketOrderManagementService: 20. Validate ticket purchaseability and quantity
    alt Ticket validation fails
        TicketOrderManagementService-->>EventUserController: 21. Return error message
        EventUserController-->>TicketPurchaseScreen: 22. Return error response
        TicketPurchaseScreen-->>User: 23. Show error message
    else Ticket validation succeeds
        TicketOrderManagementService->>WalletTransactionCoordinatorService: 24. coordinateTransferToEscrow()
        activate WalletTransactionCoordinatorService
        WalletTransactionCoordinatorService->>WalletRepository: 25. findOneOrFail()
        activate WalletRepository
        WalletRepository->>Database: 26. Query wallet by accountId
        activate Database
        Database-->>WalletRepository: 27. Return wallet
        deactivate Database
        WalletRepository-->>WalletTransactionCoordinatorService: 28. Return wallet
        deactivate WalletRepository
        WalletTransactionCoordinatorService->>WalletTransactionCoordinatorService: 29. Validate wallet can update balance
        WalletTransactionCoordinatorService->>WalletTransactionManagementService: 31. transferFundsFromUserWallet()
        activate WalletTransactionManagementService
        WalletTransactionManagementService->>WalletRepository: 32. findOneOrFail()
        activate WalletRepository
        WalletRepository->>Database: 33. Query source and destination wallets
        activate Database
        Database-->>WalletRepository: 34. Return wallets
        deactivate Database
        WalletRepository-->>WalletTransactionManagementService: 35. Return wallets
        deactivate WalletRepository
        WalletTransactionManagementService->>WalletTransactionManagementService: 36. Validate wallets can update balance
        WalletTransactionManagementService->>WalletTransactionRepository: 38. save()
        activate WalletTransactionRepository
        WalletTransactionRepository->>Database: 39. Insert wallet transaction
        activate Database
        Database-->>WalletTransactionRepository: 40. Return wallet transaction
        deactivate Database
        WalletTransactionRepository-->>WalletTransactionManagementService: 41. Return wallet transaction
        deactivate WalletTransactionRepository
        WalletTransactionManagementService->>WalletActionService: 42. withdrawFunds()
        activate WalletActionService
        WalletActionService->>WalletRepository: 43. update()
        activate WalletRepository
        WalletRepository->>Database: 44. Update source wallet balance
        activate Database
        Database-->>WalletRepository: 45. Return update result
        deactivate Database
        WalletRepository-->>WalletActionService: 46. Return update result
        deactivate WalletRepository
        WalletActionService-->>WalletTransactionManagementService: 47. Return success
        deactivate WalletActionService
        WalletTransactionManagementService->>WalletActionService: 48. depositFunds()
        activate WalletActionService
        WalletActionService->>WalletRepository: 49. update()
        activate WalletRepository
        WalletRepository->>Database: 50. Update destination wallet balance
        activate Database
        Database-->>WalletRepository: 51. Return update result
        deactivate Database
        WalletRepository-->>WalletActionService: 52. Return update result
        deactivate WalletRepository
        WalletActionService-->>WalletTransactionManagementService: 53. Return success
        deactivate WalletActionService
        WalletTransactionManagementService->>WalletTransactionRepository: 54. update()
        activate WalletTransactionRepository
        WalletTransactionRepository->>Database: 55. Update transaction status
        activate Database
        Database-->>WalletTransactionRepository: 56. Return update result
        deactivate Database
        WalletTransactionRepository-->>WalletTransactionManagementService: 57. Return update result
        deactivate WalletTransactionRepository
        WalletTransactionManagementService-->>WalletTransactionCoordinatorService: 58. Return wallet transaction
        deactivate WalletTransactionManagementService
        WalletTransactionCoordinatorService-->>TicketOrderManagementService: 59. Return wallet transaction
        deactivate WalletTransactionCoordinatorService
        TicketOrderManagementService->>TicketOrderRepository: 60. save()
        activate TicketOrderRepository
        TicketOrderRepository->>Database: 61. Insert ticket order and details
        activate Database
        Database-->>TicketOrderRepository: 62. Return ticket order
        deactivate Database
        TicketOrderRepository-->>TicketOrderManagementService: 63. Return ticket order
        deactivate TicketOrderRepository
        TicketOrderManagementService->>EventTicketRepository: 64. reserveTickets()
        activate EventTicketRepository
        EventTicketRepository->>Database: 65. Update ticket quantities
        activate Database
        Database-->>EventTicketRepository: 66. Return updated tickets
        deactivate Database
        EventTicketRepository-->>TicketOrderManagementService: 67. Return updated tickets
        deactivate EventTicketRepository
        TicketOrderManagementService->>EventAttendanceManagementService: 68. createEventAttendanceEntitiesFromTicketOrder()
        activate EventAttendanceManagementService
        EventAttendanceManagementService->>TicketOrderRepository: 69. findOneOrFail()
        activate TicketOrderRepository
        TicketOrderRepository->>Database: 70. Query ticket order with details
        activate Database
        Database-->>TicketOrderRepository: 71. Return ticket order
        deactivate Database
        TicketOrderRepository-->>EventAttendanceManagementService: 72. Return ticket order
        deactivate TicketOrderRepository
        EventAttendanceManagementService->>AccountRepository: 73. findOneOrFail()
        activate AccountRepository
        AccountRepository->>Database: 74. Query account by ID
        activate Database
        Database-->>AccountRepository: 75. Return account
        deactivate Database
        AccountRepository-->>EventAttendanceManagementService: 76. Return account
        deactivate AccountRepository
        EventAttendanceManagementService->>EventAttendanceRepository: 77. save()
        activate EventAttendanceRepository
        EventAttendanceRepository->>Database: 78. Insert event attendance entities
        activate Database
        Database-->>EventAttendanceRepository: 79. Return event attendance entities
        deactivate Database
        EventAttendanceRepository-->>EventAttendanceManagementService: 80. Return event attendance entities
        deactivate EventAttendanceRepository
        EventAttendanceManagementService-->>TicketOrderManagementService: 81. Return success
        deactivate EventAttendanceManagementService
        TicketOrderManagementService-->>EventUserController: 84. Return success response
        deactivate TicketOrderManagementService
        EventUserController-->>TicketPurchaseScreen: 85. Return success response
        deactivate EventUserController
        TicketPurchaseScreen-->>User: 86. Show success message
        deactivate TicketPurchaseScreen
    end
```
