```mermaid
---
config:
  theme: redux
  look: classic
---
sequenceDiagram
    participant User
    participant Screen
    participant VoucherController as :LocationVoucherBusinessController
    participant VoucherService as :VoucherExchangeService
    participant ExchangeHistoryRepo as :UserLocationVoucherExchangeHistoryRepository
    participant Database

    User->>Screen: 1. Submit voucher code
    activate Screen
    Screen->>VoucherController: 2. POST /business/location-voucher/verify-code
    activate VoucherController
    VoucherController->>VoucherService: 3. useVoucherByCode()
    activate VoucherService

    VoucherService->>ExchangeHistoryRepo: 4. findOne()
    activate ExchangeHistoryRepo
    ExchangeHistoryRepo->>Database: 5. Query voucher_exchange_history
    activate Database
    Database-->>ExchangeHistoryRepo: 6. exchangeRecord
    deactivate Database
    ExchangeHistoryRepo-->>VoucherService: 7. exchangeRecord
    deactivate ExchangeHistoryRepo

    alt Voucher invalid (not found/used/expired)
        VoucherService-->>VoucherController: 8. Error response
        VoucherController-->>Screen: 9. Error response
        Screen-->>User: 10. Error message
        deactivate Screen
        deactivate VoucherService
        deactivate VoucherController
    else Voucher valid
        VoucherService->>ExchangeHistoryRepo: 11. update()
        activate ExchangeHistoryRepo
        ExchangeHistoryRepo->>Database: 12. UPDATE voucher_exchange_history
        activate Database
        Database-->>ExchangeHistoryRepo: 13. updated
        deactivate Database
        ExchangeHistoryRepo-->>VoucherService: 14. updated
        deactivate ExchangeHistoryRepo

        VoucherService-->>VoucherController: 15. Success response
        deactivate VoucherService
        VoucherController-->>Screen: 16. Success response
        deactivate VoucherController
        Screen-->>User: 17. Success message
        deactivate Screen
    end
```

**Figure 18:** Sequence diagram illustrating the flow of business processing voucher codes, including voucher code validation (existence, usage status, expiration), and marking voucher as used.
