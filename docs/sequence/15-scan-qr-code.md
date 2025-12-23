```mermaid
---
config:
  theme: redux
  look: classic
---
sequenceDiagram
    participant User
    participant Screen as :QRCodeScannerScreen
    participant QRController as :QRCodeScanUserController
    participant QRService as :QRCodeScanService
    participant QRCodeRepository as :OneTimeQRCodeRepository
    participant CheckinMissionService as :CheckinMissionService
    participant CheckInRepo as :CheckInRepository
    participant UserLocationProfileService as :UserLocationProfileService
    participant UserLocationProfileRepo as :UserLocationProfileRepository
    participant Database

    User->>Screen: 1. Scan QR code
    activate Screen
    Screen->>QRController: 2. POST /user/qr-scan/scan<br/>(ScanQRCodeDto + JwtTokenDto)
    activate QRController
    QRController->>QRService: 3. scanQRCode()
    activate QRService

    QRService->>QRCodeRepository: 4. findValidQRCode()
    activate QRCodeRepository
    QRCodeRepository->>Database: 5. Query one_time_qr_codes
    activate Database
    Database-->>QRCodeRepository: 6. oneTimeQR
    deactivate Database
    QRCodeRepository-->>QRService: 7. oneTimeQR
    deactivate QRCodeRepository

    QRService->>CheckinMissionService: 8. canUserDoMission()
    activate CheckinMissionService
    CheckinMissionService->>CheckInRepo: 9. findOne()
    activate CheckInRepo
    CheckInRepo->>Database: 10. Query check_ins
    activate Database
    Database-->>CheckInRepo: 11. checkIn
    deactivate Database
    CheckInRepo-->>CheckinMissionService: 12. checkIn
    deactivate CheckInRepo
    CheckinMissionService-->>QRService: 13. canDoMission
    deactivate CheckinMissionService

    QRService->>QRCodeRepository: 14. Update QR code
    activate QRCodeRepository
    QRCodeRepository->>Database: 15. UPDATE one_time_qr_codes<br/>(isUsed, scannedBy, scannedAt)
    activate Database
    Database-->>QRCodeRepository: 16. updated
    deactivate Database
    QRCodeRepository-->>QRService: 17. success
    deactivate QRCodeRepository

    QRService->>UserLocationProfileService: 18. getUserLocationProfile()
    activate UserLocationProfileService
    UserLocationProfileService->>UserLocationProfileRepo: 19. findByUserAndLocation()
    activate UserLocationProfileRepo
    UserLocationProfileRepo->>Database: 20. Query user_location_profiles
    activate Database
    Database-->>UserLocationProfileRepo: 21. profile
    deactivate Database
    UserLocationProfileRepo-->>UserLocationProfileService: 22. profile
    deactivate UserLocationProfileRepo
    UserLocationProfileService-->>QRService: 23. profile
    deactivate UserLocationProfileService

    QRService-->>QRController: 24. Return response
    deactivate QRService
    QRController-->>Screen: 25. Success response
    deactivate QRController
    Screen-->>User: 26. Success message
    deactivate Screen
```

**Figure 15:** Sequence diagram illustrating the flow of scanning a QR code to process missions for users, including validation, mission progress tracking, points awarding, and response building.
