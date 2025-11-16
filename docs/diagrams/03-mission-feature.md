# Mission Feature - Class & Sequence Diagrams

## Class Diagram

```mermaid
classDiagram
    class LocationMissionEntity {
        +UUID id
        +UUID locationId
        +String title
        +String description
        +Integer target
        +Date startDate
        +Date endDate
        +Integer reward
        +String[] imageUrls
        +Date createdAt
        +Date updatedAt
        +isActive() Boolean
    }

    class UserMissionProgressEntity {
        +UUID id
        +UUID userProfileId
        +UUID missionId
        +Integer progress
        +Boolean completed
        +isComplete() Boolean
        +getProgressPercentage() Number
    }

    class UserProfileEntity {
        +UUID accountId
        +Integer points
        +UUID rankId
        +addPoints(amount) void
        +deductPoints(amount) void
    }

    class LocationEntity {
        +UUID id
        +String name
        +String addressLine
        +Decimal latitude
        +Decimal longitude
        +UUID businessId
    }

    class OneTimeQRCodeEntity {
        +UUID id
        +UUID locationId
        +String qrCodeData
        +UUID businessOwnerId
        +String referenceId
        +Boolean isUsed
        +UUID scannedBy
        +Date scannedAt
        +Date createdAt
        +isValid() Boolean
    }

    class ILocationMissionService {
        <<interface>>
        +createMission(locationId, dto) Promise~Mission~
        +getMissionsByLocation(locationId, query) Promise~Paginated~
        +getMissionById(missionId) Promise~Mission~
        +updateMission(missionId, dto) Promise~Mission~
        +deleteMission(missionId) Promise~void~
        +getActiveMissionsByLocation(locationId, query) Promise~Paginated~
        +getAvailableMissionsForUser(locationId, userId, query) Promise~Paginated~
        +getCompletedMissionsByUser(locationId, userId, query) Promise~Paginated~
    }

    class IQRCodeScanService {
        <<interface>>
        +scanQRCode(userId, dto) Promise~QRScanResult~
        +getUserScanHistory(userId) Promise~QRScanHistory[]~
        +getBusinessScanHistory(businessOwnerId) Promise~QRScanHistory[]~
        +getUserMissions(userId, locationId) Promise~Mission[]~
        +getMyMissionsInProgress(userId, locationId) Promise~Mission[]~
        +getUserMissionProgress(userId, missionId) Promise~MissionProgress~
    }

    class QRCodeScanService {
        -OneTimeQRCodeRepository qrCodeRepository
        -UserMissionProgressRepository missionProgressRepository
        -LocationMissionRepository missionRepository
        -UserProfileRepository userProfileRepository
        -LocationVoucherService voucherService
        +scanQRCode(userId, dto) Promise~QRScanResult~
        +getUserScanHistory(userId) Promise~QRScanHistory[]~
        +getUserMissions(userId, locationId) Promise~Mission[]~
        +getMyMissionsInProgress(userId, locationId) Promise~Mission[]~
        +getUserMissionProgress(userId, missionId) Promise~MissionProgress~
    }

    class LocationMissionUserController {
        -ILocationMissionService locationMissionService
        -IQRCodeScanService qrCodeScanService
        +getMyMissions(locationId, user) Promise~Mission[]~
        +getMyMissionsInProgress(locationId, user) Promise~Mission[]~
        +getMyMissionProgress(missionId, user) Promise~MissionProgress~
        +getMissionsByLocation(locationId, query, user) Promise~Paginated~
    }

    class QRCodeScanUserController {
        -IQRCodeScanService qrCodeScanService
        +scanQRCode(dto, user) Promise~QRScanResult~
        +getUserScanHistory(user) Promise~QRScanHistory[]~
    }

    %% Relationships
    LocationEntity ||--o{ LocationMissionEntity : "has"
    UserProfileEntity ||--o{ UserMissionProgressEntity : "tracks"
    LocationMissionEntity ||--o{ UserMissionProgressEntity : "tracked by"
    LocationEntity ||--o{ OneTimeQRCodeEntity : "has"
    UserProfileEntity ||--o{ OneTimeQRCodeEntity : "scans"

    IQRCodeScanService <|.. QRCodeScanService
    LocationMissionUserController --> ILocationMissionService
    LocationMissionUserController --> IQRCodeScanService
    QRCodeScanUserController --> IQRCodeScanService
```

## Sequence Diagram: Scan QR Code and Complete Mission

### Class Diagram: Scan QR Code and Complete Mission

```mermaid
classDiagram
    class QRCodeScanUserController {
        +scanQRCode(dto, user) Promise~QRScanResult~
    }
    class QRCodeScanService {
        +scanQRCode(userId, dto) Promise~QRScanResult~
    }
    class OneTimeQRCodeRepository {
        +findByQrCodeData(data) OneTimeQRCode
        +updateIsUsed(id, userId, time) void
    }
    class LocationMissionRepository {
        +findMissionByLocationId(locationId) LocationMission
    }
    class UserMissionProgressRepository {
        +findOne(userId, missionId) UserMissionProgress
        +create(entity) UserMissionProgress
        +incrementProgress(entity) UserMissionProgress
        +updateCompleted(entity, completed) void
    }
    class UserProfileRepository {
        +addPoints(userId, amount) void
    }
    class LocationVoucherService {
        +createVoucherForMission(mission) Voucher
    }
    class OneTimeQRCodeEntity {
        +UUID id
        +UUID locationId
        +Boolean isUsed
    }

    QRCodeScanUserController --> QRCodeScanService
    QRCodeScanService --> OneTimeQRCodeRepository
    QRCodeScanService --> LocationMissionRepository
    QRCodeScanService --> UserMissionProgressRepository
    QRCodeScanService --> UserProfileRepository
    QRCodeScanService --> LocationVoucherService
    OneTimeQRCodeRepository --> OneTimeQRCodeEntity
```

```mermaid
sequenceDiagram
    participant Client
    participant QRController as QRCodeScanUserController
    participant QRService as QRCodeScanService
    participant QRRepository as OneTimeQRCodeRepository
    participant MissionProgressRepository
    participant MissionRepository as LocationMissionRepository
    participant VoucherService as LocationVoucherService
    participant UserProfileRepository

    Client->>QRController: POST /user/qr-scan/scan (ScanQRCodeDto)
    QRController->>QRService: scanQRCode(userId, dto)

    QRService->>QRRepository: findByQrCodeData(qrCodeData)
    QRRepository-->>QRService: qrCode

    alt QR Code not found
        QRService-->>QRController: BadRequestException("QR code not found")
        QRController-->>Client: 400 Bad Request
    else QR Code already used
        QRService-->>QRController: BadRequestException("QR code already used")
        QRController-->>Client: 400 Bad Request
    end

    alt QR Code belongs to location mission
        QRService->>MissionRepository: findMissionByLocationId(qrCode.locationId)
        MissionRepository-->>QRService: mission

        QRService->>MissionProgressRepository: findOne(userId, missionId)
        MissionProgressRepository-->>QRService: missionProgress

        alt Mission progress not found
            QRService->>MissionProgressRepository: create(UserMissionProgressEntity)
            Note over MissionProgressRepository: progress = 1<br/>completed = false
            MissionProgressRepository-->>QRService: newProgress
        else Mission progress exists
            QRService->>MissionProgressRepository: incrementProgress(missionProgress)
            MissionProgressRepository-->>QRService: updatedProgress
        end

        alt Mission completed (progress >= target)
            QRService->>MissionProgressRepository: updateCompleted(missionProgress, true)
            MissionProgressRepository-->>QRService: completed

            QRService->>UserProfileRepository: addPoints(userId, mission.reward)
            UserProfileRepository-->>QRService: updated

            alt Mission reward is voucher
                QRService->>VoucherService: createVoucherForMission(mission)
                VoucherService-->>QRService: voucher
            end
        end
    end

    QRService->>QRRepository: updateIsUsed(qrCode.id, userId, now())
    QRRepository-->>QRService: updated

    QRService-->>QRController: QRScanResultDto
    QRController-->>Client: 200 OK
```

## Sequence Diagram: Get User Missions

### Class Diagram: Get User Missions

```mermaid
classDiagram
    class LocationMissionUserController {
        +getMyMissions(locationId, user) Promise~Mission[]~
    }
    class QRCodeScanService {
        +getUserMissions(userId, locationId) Promise~Mission[]~
    }
    class UserMissionProgressRepository {
        +createQueryBuilder(alias) QueryBuilder
        +getMany() MissionProgress[]
    }
    class LocationMissionRepository {
        +findByIds(ids) LocationMission[]
    }

    LocationMissionUserController --> QRCodeScanService
    QRCodeScanService --> UserMissionProgressRepository
    QRCodeScanService --> LocationMissionRepository
```

```mermaid
sequenceDiagram
    participant Client
    participant MissionController as LocationMissionUserController
    participant QRService as QRCodeScanService
    participant MissionProgressRepository

    Client->>MissionController: GET /user/location-mission/my-missions?locationId=xxx
    MissionController->>QRService: getUserMissions(userId, locationId)

    QRService->>MissionProgressRepository: createQueryBuilder('progress')

    QRService->>MissionProgressRepository: leftJoinAndSelect('mission')
    QRService->>MissionProgressRepository: leftJoinAndSelect('location')

    QRService->>MissionProgressRepository: where('progress.userProfileId = :userId', {userId})

    alt locationId provided
        QRService->>MissionProgressRepository: andWhere('mission.locationId = :locationId', {locationId})
    end

    QRService->>MissionProgressRepository: orderBy('progress.completed', 'ASC')
    QRService->>MissionProgressRepository: addOrderBy('mission.createdAt', 'DESC')

    QRService->>MissionProgressRepository: getMany()
    MissionProgressRepository-->>QRService: missions[]

    QRService-->>MissionController: MissionProgressDto[]
    MissionController-->>Client: 200 OK
```

## Sequence Diagram: Get Missions In Progress

### Class Diagram: Get Missions In Progress

```mermaid
classDiagram
    class LocationMissionUserController {
        +getMyMissionsInProgress(locationId, user) Promise~Mission[]~
    }
    class QRCodeScanService {
        +getMyMissionsInProgress(userId, locationId) Promise~Mission[]~
    }
    class UserMissionProgressRepository {
        +createQueryBuilder(alias) QueryBuilder
        +getMany() MissionProgress[]
    }

    LocationMissionUserController --> QRCodeScanService
    QRCodeScanService --> UserMissionProgressRepository
```

```mermaid
sequenceDiagram
    participant Client
    participant MissionController as LocationMissionUserController
    participant QRService as QRCodeScanService
    participant MissionProgressRepository

    Client->>MissionController: GET /user/location-mission/my-missions/in-progress?locationId=xxx
    MissionController->>QRService: getMyMissionsInProgress(userId, locationId)

    QRService->>MissionProgressRepository: createQueryBuilder('progress')

    QRService->>MissionProgressRepository: leftJoinAndSelect('mission')
    QRService->>MissionProgressRepository: leftJoinAndSelect('location')

    QRService->>MissionProgressRepository: where('progress.userProfileId = :userId', {userId})
    QRService->>MissionProgressRepository: andWhere('progress.completed = :completed', {completed: false})

    alt locationId provided
        QRService->>MissionProgressRepository: andWhere('mission.locationId = :locationId', {locationId})
    end

    QRService->>MissionProgressRepository: orderBy('mission.createdAt', 'DESC')
    QRService->>MissionProgressRepository: getMany()
    MissionProgressRepository-->>QRService: missions[]

    QRService-->>MissionController: MissionProgressDto[]
    MissionController-->>Client: 200 OK
```

## Sequence Diagram: Get QR Scan History

### Class Diagram: Get QR Scan History

```mermaid
classDiagram
    class QRCodeScanUserController {
        +getUserScanHistory(user) Promise~QRScanHistory[]~
    }
    class QRCodeScanService {
        +getUserScanHistory(userId) Promise~QRScanHistory[]~
    }
    class OneTimeQRCodeRepository {
        +findScannedByUser(userId) OneTimeQRCode[]
    }
    class OneTimeQRCodeEntity {
        +UUID id
        +UUID locationId
        +Boolean isUsed
        +Date scannedAt
    }

    QRCodeScanUserController --> QRCodeScanService
    QRCodeScanService --> OneTimeQRCodeRepository
    OneTimeQRCodeRepository --> OneTimeQRCodeEntity
```

```mermaid
sequenceDiagram
    participant Client
    participant QRController as QRCodeScanUserController
    participant QRService as QRCodeScanService
    participant QRRepository as OneTimeQRCodeRepository

    Client->>QRController: GET /user/qr-scan/history
    QRController->>QRService: getUserScanHistory(userId)

    QRService->>QRRepository: findScannedByUser(userId)
    Note over QRRepository: WHERE scannedBy = userId<br/>AND isUsed = true<br/>WITH relations: location
    QRRepository-->>QRService: scannedQRCodes[]

    QRService->>QRService: mapToResponseDto(scannedQRCodes)
    Note over QRService: Include location, scannedAt, etc.

    QRService-->>QRController: UserQRScanHistoryResponseDto[]
    QRController-->>Client: 200 OK
```
