# Sequence Diagrams - User, Post, Itinerary, Mission, Voucher Features

## 1. Create Post Flow

```mermaid
sequenceDiagram
    participant Client
    participant PostController as PostUserController
    participant PostService
    participant FileStorageService as IFileStorageService
    participant PostRepository
    participant AnalyticRepository
    participant EventEmitter

    Client->>PostController: POST /user/post (CreatePostDto)
    PostController->>PostService: createPost(dto, userId)

    alt Image URLs provided
        PostService->>FileStorageService: confirmUpload(imageUrls)
        FileStorageService-->>PostService: success
    end

    PostService->>PostRepository: save(PostEntity)
    PostRepository-->>PostService: savedPost

    PostService->>AnalyticRepository: create(AnalyticEntity)
    AnalyticRepository-->>PostService: analytic

    PostService->>EventEmitter: emit(POST_CREATED_EVENT)
    EventEmitter-->>PostService: emitted

    PostService-->>PostController: PostResponseDto
    PostController-->>Client: 201 Created
```

**Figure 1:** Sequence diagram illustrating the flow of creating a new post, including file storage confirmation, post saving, analytics creation, and event emission.

## 2. Create Itinerary Flow

```mermaid
sequenceDiagram
    participant Client
    participant ItineraryController as ItineraryUserController
    participant ItineraryService
    participant FileStorageService as IFileStorageService
    participant DataSource
    participant ItineraryRepository
    participant ItineraryLocationRepository

    Client->>ItineraryController: POST /user/itinerary (CreateItineraryDto)
    ItineraryController->>ItineraryService: createItinerary(userId, dto)

    ItineraryService->>DataSource: transaction()

    alt Thumbnail URL provided
        ItineraryService->>FileStorageService: confirmUpload([thumbnailUrl])
        FileStorageService-->>ItineraryService: success
    end

    ItineraryService->>DataSource: create(ItineraryEntity)
    ItineraryService->>DataSource: save(itinerary)
    DataSource-->>ItineraryService: savedItinerary

    alt Locations provided
        loop For each location
            ItineraryService->>DataSource: create(ItineraryLocationEntity)
        end
        ItineraryService->>DataSource: save(locations)
        DataSource-->>ItineraryService: savedLocations
    end

    ItineraryService->>ItineraryRepository: findOne(with relations)
    ItineraryRepository-->>ItineraryService: completeItinerary

    ItineraryService-->>DataSource: commit()
    ItineraryService-->>ItineraryController: ItineraryResponseDto
    ItineraryController-->>Client: 201 Created
```

**Figure 2:** Sequence diagram showing the flow of creating an itinerary, including file storage confirmation, transaction handling, and location association.

## 3. Update Itinerary Album Flow

```mermaid
sequenceDiagram
    participant Client
    participant ItineraryController as ItineraryUserController
    participant ItineraryService
    participant FileStorageService as IFileStorageService
    participant DataSource
    participant ItineraryRepository

    Client->>ItineraryController: PATCH /user/itinerary/:id (UpdateItineraryDto)
    ItineraryController->>ItineraryService: updateItinerary(id, userId, dto)

    ItineraryService->>DataSource: transaction()

    ItineraryService->>ItineraryRepository: findOne(id, userId)
    ItineraryRepository-->>ItineraryService: existingItinerary

    alt Itinerary not found
        ItineraryService-->>ItineraryController: NotFoundException
        ItineraryController-->>Client: 404 Not Found
    end

    alt Album provided
        ItineraryService->>FileStorageService: confirmUpload(album)
        FileStorageService-->>ItineraryService: success
    end

    alt Thumbnail URL provided
        ItineraryService->>FileStorageService: confirmUpload([thumbnailUrl])
        FileStorageService-->>ItineraryService: success
    end

    ItineraryService->>DataSource: update(ItineraryEntity, dto)
    DataSource-->>ItineraryService: updated

    ItineraryService->>ItineraryRepository: findOne(with relations)
    ItineraryRepository-->>ItineraryService: updatedItinerary

    ItineraryService-->>DataSource: commit()
    ItineraryService-->>ItineraryController: ItineraryResponseDto
    ItineraryController-->>Client: 200 OK
```

**Figure 3:** Sequence diagram illustrating the flow of updating an itinerary album, including authorization checks, file storage confirmation, and metadata updates.

## 4. Scan QR Code and Complete Mission Flow

```mermaid
sequenceDiagram
    participant Client
    participant QRController as QRCodeScanUserController
    participant QRService as QRCodeScanService
    participant QRRepository as OneTimeQRCodeRepository
    participant MissionProgressRepository
    participant MissionRepository
    participant VoucherService as LocationVoucherService
    participant UserProfileRepository

    Client->>QRController: POST /user/qr-scan/scan (ScanQRCodeDto)
    QRController->>QRService: scanQRCode(userId, dto)

    QRService->>QRRepository: findByQrCodeData(qrCodeData)
    QRRepository-->>QRService: qrCode

    alt QR Code not found or already used
        QRService-->>QRController: BadRequestException
        QRController-->>Client: 400 Bad Request
    end

    alt QR Code belongs to location mission
        QRService->>MissionProgressRepository: findOne(userId, missionId)
        MissionProgressRepository-->>QRService: missionProgress

        alt Mission progress not found
            QRService->>MissionProgressRepository: create(UserMissionProgressEntity)
            MissionProgressRepository-->>QRService: newProgress
        end

        QRService->>MissionProgressRepository: incrementProgress(missionProgress)
        MissionProgressRepository-->>QRService: updatedProgress

        alt Mission completed
            QRService->>MissionRepository: findOne(missionId)
            MissionRepository-->>QRService: mission

            QRService->>UserProfileRepository: addPoints(userId, reward)
            UserProfileRepository-->>QRService: updated

            alt Mission reward is voucher
                QRService->>VoucherService: createVoucherForMission(mission)
                VoucherService-->>QRService: voucher
            end
        end
    end

    QRService->>QRRepository: updateIsUsed(qrCode.id, userId)
    QRRepository-->>QRService: updated

    QRService-->>QRController: QRScanResultDto
    QRController-->>Client: 200 OK
```

**Figure 4:** Sequence diagram showing the flow of scanning a QR code and completing a mission, including QR code validation, mission progress tracking, reward distribution, and voucher creation.

## 5. Exchange Voucher Flow

```mermaid
sequenceDiagram
    participant Client
    participant VoucherController as VoucherUserController
    participant VoucherExchangeService
    participant VoucherRepository as LocationVoucherRepository
    participant UserProfileRepository
    participant VoucherHistoryRepository as UserLocationVoucherExchangeHistoryRepository

    Client->>VoucherController: POST /user/voucher/exchange (voucherId)
    VoucherController->>VoucherExchangeService: exchangeVoucher(userId, voucherId)

    VoucherExchangeService->>VoucherRepository: findOne(voucherId)
    VoucherRepository-->>VoucherExchangeService: voucher

    alt Voucher not found or not available
        VoucherExchangeService-->>VoucherController: BadRequestException
        VoucherController-->>Client: 400 Bad Request
    end

    VoucherExchangeService->>UserProfileRepository: getUserProfile(userId)
    UserProfileRepository-->>VoucherExchangeService: userProfile

    alt Insufficient points
        VoucherExchangeService-->>VoucherController: BadRequestException
        VoucherController-->>Client: 400 Bad Request
    end

    VoucherExchangeService->>UserProfileRepository: deductPoints(userId, pricePoint)
    UserProfileRepository-->>VoucherExchangeService: updated

    VoucherExchangeService->>VoucherRepository: decrementQuantity(voucherId)
    VoucherRepository-->>VoucherExchangeService: updated

    VoucherExchangeService->>VoucherHistoryRepository: create(UserLocationVoucherExchangeHistoryEntity)
    VoucherHistoryRepository-->>VoucherExchangeService: voucherHistory

    VoucherExchangeService-->>VoucherController: UserVoucherResponseDto
    VoucherController-->>Client: 200 OK
```

**Figure 5:** Sequence diagram illustrating the flow of exchanging a voucher, including voucher validation, points deduction, quantity management, and voucher history creation.

## 6. Get User Missions Flow

```mermaid
sequenceDiagram
    participant Client
    participant MissionController as LocationMissionUserController
    participant QRService as QRCodeScanService
    participant MissionProgressRepository
    participant MissionRepository

    Client->>MissionController: GET /user/location-mission/my-missions?locationId=xxx
    MissionController->>QRService: getUserMissions(userId, locationId)

    QRService->>MissionProgressRepository: createQueryBuilder()

    QRService->>MissionProgressRepository: where(userProfileId = userId)

    alt locationId provided
        QRService->>MissionProgressRepository: andWhere(locationId = locationId)
    end

    QRService->>MissionProgressRepository: leftJoin('mission')
    QRService->>MissionProgressRepository: leftJoin('location')

    QRService->>MissionProgressRepository: orderBy(completed ASC, createdAt DESC)
    QRService->>MissionProgressRepository: getMany()
    MissionProgressRepository-->>QRService: missions

    QRService-->>MissionController: MissionProgressDto[]
    MissionController-->>Client: 200 OK
```

**Figure 6:** Sequence diagram showing the flow of retrieving user missions, including query building, filtering by location, and ordering results.

## 7. Get User Available Vouchers Flow

```mermaid
sequenceDiagram
    participant Client
    participant VoucherController as VoucherUserController
    participant VoucherExchangeService
    participant VoucherHistoryRepository as UserLocationVoucherExchangeHistoryRepository

    Client->>VoucherController: GET /user/voucher/vouchers
    VoucherController->>VoucherExchangeService: getUserVouchers(userId)

    VoucherExchangeService->>VoucherHistoryRepository: findAvailableByUser(userId)
    Note over VoucherHistoryRepository: WHERE userProfileId = userId<br/>AND usedAt IS NULL<br/>WITH relations: voucher, voucher.location

    VoucherHistoryRepository-->>VoucherExchangeService: userVouchers[]

    VoucherExchangeService-->>VoucherController: UserVoucherResponseDto[]
    VoucherController-->>Client: 200 OK
```

**Figure 7:** Sequence diagram illustrating the flow of retrieving user available vouchers, including filtering by usage status and mapping to response DTOs.

## 8. Use Voucher Flow

```mermaid
sequenceDiagram
    participant Client
    participant BusinessController as LocationMissionBusinessController
    participant VoucherExchangeService
    participant VoucherHistoryRepository as UserLocationVoucherExchangeHistoryRepository
    participant VoucherRepository as LocationVoucherRepository

    Client->>BusinessController: POST /business/voucher/use (voucherCode)
    BusinessController->>VoucherExchangeService: useVoucher(userId, voucherCode)

    VoucherExchangeService->>VoucherHistoryRepository: findByUserVoucherCode(voucherCode)
    VoucherHistoryRepository-->>VoucherExchangeService: voucherHistory

    alt Voucher not found or already used
        VoucherExchangeService-->>BusinessController: BadRequestException
        BusinessController-->>Client: 400 Bad Request
    end

    alt Voucher expired
        VoucherExchangeService-->>BusinessController: BadRequestException
        BusinessController-->>Client: 400 Bad Request
    end

    VoucherExchangeService->>VoucherHistoryRepository: updateUsedAt(voucherHistory.id, now())
    VoucherHistoryRepository-->>VoucherExchangeService: updated

    VoucherExchangeService-->>BusinessController: success
    BusinessController-->>Client: 200 OK
```

**Figure 8:** Sequence diagram showing the flow of using a voucher by a business owner, including voucher validation, expiration checks, and usage tracking.

## 9. Get Free Available Vouchers Flow

```mermaid
sequenceDiagram
    participant Client
    participant VoucherController as LocationVoucherUserController
    participant VoucherService as LocationVoucherService
    participant VoucherRepository as LocationVoucherRepository
    participant Paginate

    Client->>VoucherController: GET /user/location-voucher/free?page=1&limit=10
    VoucherController->>VoucherService: getFreeAvailableVouchers(query)

    VoucherService->>VoucherRepository: createQueryBuilder('voucher')

    VoucherService->>VoucherRepository: leftJoinAndSelect('location')

    VoucherService->>VoucherRepository: where(pricePoint = 0)
    VoucherService->>VoucherRepository: andWhere(startDate <= now())
    VoucherService->>VoucherRepository: andWhere(endDate >= now())
    VoucherService->>VoucherRepository: andWhere(maxQuantity > 0)

    VoucherService->>Paginate: paginate(query, queryBuilder, config)
    Paginate->>VoucherRepository: getMany()
    VoucherRepository-->>Paginate: vouchers[]
    Paginate-->>VoucherService: Paginated<Voucher>

    VoucherService-->>VoucherController: Paginated<VoucherResponseDto>
    VoucherController-->>Client: 200 OK
```

**Figure 9:** Sequence diagram illustrating the flow of retrieving free available vouchers, including filtering by price point, date range, and quantity availability.

## 10. Create Post and Track Analytics Flow

```mermaid
sequenceDiagram
    participant Client
    participant PostController as PostUserController
    participant PostService
    participant FileStorageService as IFileStorageService
    participant PostRepository
    participant AnalyticRepository
    participant LocationAnalyticsRepository
    participant EventEmitter

    Client->>PostController: POST /user/post (CreatePostDto)
    PostController->>PostService: createPost(dto, userId)

    alt Image URLs provided
        PostService->>FileStorageService: confirmUpload(imageUrls)
        FileStorageService-->>PostService: success
    end

    PostService->>PostRepository: save(PostEntity)
    PostRepository-->>PostService: savedPost

    PostService->>AnalyticRepository: create(AnalyticEntity)
    Note over AnalyticRepository: entityType = POST<br/>entityId = postId
    AnalyticRepository-->>PostService: analytic

    alt Post type is REVIEW and has locationId
        PostService->>LocationAnalyticsRepository: incrementReviewCount(locationId)
        LocationAnalyticsRepository-->>PostService: updated
    end

    PostService->>EventEmitter: emit(POST_CREATED_EVENT, {postId, authorId})
    EventEmitter-->>PostService: emitted

    PostService-->>PostController: PostResponseDto
    PostController-->>Client: 201 Created
```
