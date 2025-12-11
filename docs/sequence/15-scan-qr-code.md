```mermaid
---
config:
  theme: redux
  look: classic
---
sequenceDiagram
    participant User
    participant QRCodeScannerScreen as :QRCodeScannerScreen
    participant QRController as :QRCodeScanUserController
    participant QRService as :QRCodeScanService
    participant OneTimeQRRepo as :OneTimeQRCodeRepository
    participant MissionRepo as :LocationMissionRepository
    participant ProgressRepo as :UserMissionProgressRepository
    participant LogRepo as :LocationMissionLogRepository
    participant UserLocationProfileService as :UserLocationProfileService
    participant PointsService as :UserPointsService
    participant Database

    User->>QRCodeScannerScreen: 1. Scan QR code
    activate QRCodeScannerScreen
    QRCodeScannerScreen->>QRController: 2. POST /user/qr-scan/scan<br/>(ScanQRCodeDto + JWT)
    activate QRController
    QRController->>QRService: 3. scanQRCode(userId, dto)
    activate QRService

    QRService->>OneTimeQRRepo: 4. findValidQRCode(qrCodeData)
    activate OneTimeQRRepo
    OneTimeQRRepo->>Database: 5. Query one_time_qr_codes
    activate Database
    Database-->>OneTimeQRRepo: 6. Return oneTimeQR (or null)
    deactivate Database
    OneTimeQRRepo-->>QRService: 7. Return oneTimeQR
    deactivate OneTimeQRRepo

    alt One-time QR code found
        QRService->>QRService: 8. handleOneTimeQRScan()
        QRService->>OneTimeQRRepo: 9. update()<br/>SET isUsed = true
        activate OneTimeQRRepo
        OneTimeQRRepo->>Database: 10. UPDATE one_time_qr_codes
        activate Database
        Database-->>OneTimeQRRepo: 11. Return updated
        deactivate Database
        OneTimeQRRepo-->>QRService: 12. Return updated
        deactivate OneTimeQRRepo
    else Regular QR code
        QRService->>QRService: 13. parseQRCodeData(qrCodeData)

        QRService->>MissionRepo: 14. findOne()<br/>WITH relations: location
        activate MissionRepo
        MissionRepo->>Database: 15. Query mission
        activate Database
        Database-->>MissionRepo: 16. Return mission
        deactivate Database
        MissionRepo-->>QRService: 17. Return mission
        deactivate MissionRepo

        QRService->>QRService: 18. validate mission active<br/>(startDate <= now <= endDate)

        QRService->>ProgressRepo: 19. findOne()<br/>WHERE userId AND missionId
        activate ProgressRepo
        ProgressRepo->>Database: 20. Query user_mission_progress
        activate Database
        Database-->>ProgressRepo: 21. Return userProgress (or null)
        deactivate Database
        ProgressRepo-->>QRService: 22. Return userProgress
        deactivate ProgressRepo

        alt Mission already completed
            QRService->>UserLocationProfileService: 23. getUserLocationProfile()
            activate UserLocationProfileService
            UserLocationProfileService->>Database: 24. Query user_location_profiles
            activate Database
            Database-->>UserLocationProfileService: 25. Return profile
            deactivate Database
            UserLocationProfileService-->>QRService: 26. Return profile
            deactivate UserLocationProfileService

            QRService-->>QRController: 27. Return QRCodeScanResponseDto<br/>(pointsEarned: 0, missions: [])
            QRController-->>QRCodeScannerScreen: 28. Return 200 OK
            QRCodeScannerScreen-->>User: 29. Show message
        else Mission not completed
            QRService->>ProgressRepo: 30. save()<br/>UPDATE progress = progress + 1
            activate ProgressRepo
            ProgressRepo->>Database: 31. UPDATE user_mission_progress
            activate Database
            Database-->>ProgressRepo: 32. Return updated
            deactivate Database
            ProgressRepo-->>QRService: 33. Return updated
            deactivate ProgressRepo

            QRService->>LogRepo: 34. save()<br/>INSERT INTO mission_logs
            activate LogRepo
            LogRepo->>Database: 35. INSERT INTO mission_logs
            activate Database
            Database-->>LogRepo: 36. Return created
            deactivate Database
            LogRepo-->>QRService: 37. Return created
            deactivate LogRepo

            alt Mission completed (progress >= target)
                QRService->>PointsService: 38. addPoints()<br/>type: LOCATION_MISSION
                activate PointsService
                PointsService->>Database: 39. INSERT INTO points_history<br/>UPDATE user_location_profiles
                activate Database
                Database-->>PointsService: 40. Return updated
                deactivate Database
                PointsService-->>QRService: 41. Return success
                deactivate PointsService
            end

            QRService->>UserLocationProfileService: 42. getUserLocationProfile()
            activate UserLocationProfileService
            UserLocationProfileService->>Database: 43. Query user_location_profiles
            activate Database
            Database-->>UserLocationProfileService: 44. Return profile
            deactivate Database
            UserLocationProfileService-->>QRService: 45. Return profile
            deactivate UserLocationProfileService

            QRService->>QRService: 46. build QRCodeScanResponseDto
            QRService-->>QRController: 47. Return QRCodeScanResponseDto
            deactivate QRService
            QRController-->>QRCodeScannerScreen: 48. Return QRCodeScanResponseDto
            deactivate QRController
            QRCodeScannerScreen-->>User: 49. Show success message
            deactivate QRCodeScannerScreen
        end
    end
```

**Figure 15:** Sequence diagram illustrating the flow of scanning a QR code to process missions for users, including validation, mission progress tracking, points awarding, and response building.
