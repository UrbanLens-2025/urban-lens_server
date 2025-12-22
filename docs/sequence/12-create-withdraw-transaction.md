```mermaid
---
config:
  theme: redux
  look: classic
---
sequenceDiagram
    participant User
    participant Frontend as : Create withdraw screen
    participant WalletPrivateController as : WalletPrivateController
    participant WalletExternalTransactionManagementService as : WalletExternalTransactionManagementService
    participant WalletActionService as : WalletActionService
    participant WalletRepository as : WalletRepository
    participant WalletExternalTransactionRepository as : WalletExternalTransactionRepository
    participant WalletExternalTransactionTimelineRepository as : WalletExternalTransactionTimelineRepository
    participant Database

    User->>Frontend: 1. Submit withdraw transaction form
    activate Frontend
    Frontend->>WalletPrivateController: 2. POST /private/wallet/external/withdraw
    activate WalletPrivateController
    WalletPrivateController->>WalletExternalTransactionManagementService: 3. createWithdrawTransaction()
    activate WalletExternalTransactionManagementService
    WalletExternalTransactionManagementService->>WalletRepository: 4. findByOwnedBy()
    activate WalletRepository
    WalletRepository->>Database: 5. Query wallet by ownedBy
    activate Database
    Database-->>WalletRepository: 6. Return wallet
    deactivate Database
    WalletRepository-->>WalletExternalTransactionManagementService: 7. Return wallet
    deactivate WalletRepository
    WalletExternalTransactionManagementService->>WalletExternalTransactionManagementService: 8. Validate wallet balance sufficient
    alt Insufficient balance
        WalletExternalTransactionManagementService-->>WalletPrivateController: 9. Return error message
        WalletPrivateController-->>Frontend: 10. Return error response
        Frontend-->>User: 11. Show error message
    else Balance sufficient
        WalletExternalTransactionManagementService->>WalletExternalTransactionRepository: 12. save()
        activate WalletExternalTransactionRepository
        WalletExternalTransactionRepository->>Database: 13. Insert external transaction
        activate Database
        Database-->>WalletExternalTransactionRepository: 14. Return external transaction
        deactivate Database
        WalletExternalTransactionRepository-->>WalletExternalTransactionManagementService: 15. Return external transaction
        deactivate WalletExternalTransactionRepository
        WalletExternalTransactionManagementService->>WalletActionService: 16. lockFunds()
        activate WalletActionService
        WalletActionService->>WalletActionService: 17. Validate wallet can update balance
        WalletActionService->>WalletRepository: 18. incrementLockedBalance()
        activate WalletRepository
        WalletRepository->>Database: 19. Update wallet balance and locked balance
        activate Database
        Database-->>WalletRepository: 20. Return updated wallet
        deactivate Database
        WalletRepository-->>WalletActionService: 21. Return updated wallet
        deactivate WalletRepository
        WalletActionService-->>WalletExternalTransactionManagementService: 22. Return success
        deactivate WalletActionService
        WalletExternalTransactionManagementService->>WalletExternalTransactionTimelineRepository: 23. save()
        activate WalletExternalTransactionTimelineRepository
        WalletExternalTransactionTimelineRepository->>Database: 24. Insert timeline entry
        activate Database
        Database-->>WalletExternalTransactionTimelineRepository: 25. Return timeline entry
        deactivate Database
        WalletExternalTransactionTimelineRepository-->>WalletExternalTransactionManagementService: 26. Return timeline entry
        deactivate WalletExternalTransactionTimelineRepository
        WalletExternalTransactionManagementService-->>WalletPrivateController: 27. Return success response
        deactivate WalletExternalTransactionManagementService
        WalletPrivateController-->>Frontend: 28. Return success response
        deactivate WalletPrivateController
        Frontend-->>User: 29. Show success message
        deactivate Frontend
    end
```
