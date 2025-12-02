# Sequence Diagrams - User, Post, Itinerary, Mission, Voucher Features

## 1. Create Post Flow

```mermaid
sequenceDiagram
    participant Client
    participant PostController as PostUserController
    participant PostService
    participant FileStorageService as IFileStorageService
    participant Database

    Client->>PostController: POST /user/post<br/>(CreatePostDto + JWT)
    PostController->>PostService: createPost(dto)

    PostService->>PostService: validate(dto)
    PostService->>Database: SELECT account, check_in<br/>(for validation)
    Database-->>PostService: data

    alt Validation failed
        PostService-->>PostController: BadRequestException /<br/>NotFoundException / ForbiddenException
        PostController-->>Client: 400/404/403
    end

    alt Image/Video URLs provided
        PostService->>FileStorageService: confirmUpload(imageUrls/videoIds)
        FileStorageService-->>PostService: success
    end

    PostService->>Database: INSERT INTO posts<br/>(content, type, rating, authorId,<br/>locationId, eventId, visibility,<br/>isVerified, imageUrls, ...)
    Database-->>PostService: savedPost

    alt Post type is REVIEW
        PostService->>Database: SELECT reviews<br/>WHERE locationId/eventId AND type=REVIEW
        Database-->>PostService: reviews[]
        PostService->>Database: UPDATE locations/events<br/>SET totalReviews, averageRating
        Database-->>PostService: updated

        PostService->>Database: UPDATE user_profiles<br/>SET totalReviews = totalReviews + 1
        Database-->>PostService: updated
    else Post type is BLOG
        PostService->>Database: UPDATE user_profiles<br/>SET totalBlogs = totalBlogs + 1
        Database-->>PostService: updated
    end

    PostService->>Database: SELECT post with relations<br/>(JOIN accounts, locations)
    Database-->>PostService: createdPost

    PostService->>PostService: mapRawPostToDto(createdPost)
    PostService-->>PostController: PostResponseDto
    PostController-->>Client: 201 Created
```

**Figure 1:** Sequence diagram illustrating the flow of creating a new post, including database operations for validation, post creation, analytics updates, and user profile counters.

## 2. Create Mission Flow

```mermaid
sequenceDiagram
    participant Client
    participant MissionController as LocationMissionBusinessController
    participant MissionService as LocationMissionService
    participant Database

    Client->>MissionController: POST /business/location-mission/:locationId<br/>(CreateLocationMissionDto + JWT)
    MissionController->>MissionService: createMission(locationId, dto)

    MissionService->>MissionService: validate(locationId, dto)
    MissionService->>Database: SELECT location<br/>(for validation)
    Database-->>MissionService: location

    alt Validation failed
        MissionService-->>MissionController: BadRequestException /<br/>NotFoundException
        MissionController-->>Client: 400/404
    end

    MissionService->>Database: INSERT INTO location_missions<br/>(locationId, title, description,<br/>target, reward, startDate,<br/>endDate, imageUrls)
    Database-->>MissionService: savedMission

    MissionService->>MissionService: map to response DTO
    MissionService-->>MissionController: LocationMissionResponseDto
    MissionController-->>Client: 201 Created
```

**Figure 2:** Sequence diagram illustrating the flow of creating a location mission by a business owner, including location existence verification, date range validation, and mission creation.

## 3. Scan QR Code Flow

```mermaid
sequenceDiagram
    participant Client
    participant QRController as QRCodeScanUserController
    participant QRService as QRCodeScanService
    participant Database

    Client->>QRController: POST /user/qr-scan/scan<br/>(ScanQRCodeDto + JWT)
    QRController->>QRService: scanQRCode(userId, dto)

    QRService->>QRService: validate(qrCodeData)
    QRService->>Database: SELECT one_time_qr, missions,<br/>user_progress, check_ins<br/>(for validation)
    Database-->>QRService: data

    alt Validation failed
        QRService-->>QRController: BadRequestException /<br/>NotFoundException
        QRController-->>Client: 400/404
    end

    alt Mission already completed
        QRService-->>QRController: QRCodeScanResponseDto<br/>(pointsEarned: 0, missions: [])
        QRController-->>Client: 200 OK
    end

    QRService->>Database: UPDATE user_mission_progress<br/>SET progress = progress + 1
    Database-->>QRService: updated

    QRService->>Database: INSERT INTO mission_logs<br/>(userMissionProgressId, imageUrls)
    Database-->>QRService: created

    alt Mission completed (progress >= target)
        QRService->>Database: UPDATE user_location_profiles<br/>SET totalPoints = totalPoints + reward
        Database-->>QRService: updated
    end

    alt One-time QR code
        QRService->>Database: UPDATE one_time_qr_codes<br/>SET isUsed = true, scannedBy = userId
        Database-->>QRService: updated
    end

    QRService->>Database: SELECT user_location_profile<br/>WHERE userId AND locationId
    Database-->>QRService: userLocationProfile

    QRService->>QRService: build response with<br/>mission progress and points
    QRService-->>QRController: QRCodeScanResponseDto
    QRController-->>Client: 200 OK
```

**Figure 3:** Sequence diagram illustrating the flow of scanning a QR code to process missions for users, including validation, mission progress tracking, points awarding, and response building.

## 4. Check-in to Location Flow

```mermaid
sequenceDiagram
    participant Client
    participant LocationController as LocationUserController
    participant CheckInService as CheckInV2Service
    participant Database

    Client->>LocationController: POST /user/locations/:locationId/check-in<br/>(RegisterCheckInDto + JWT)
    LocationController->>CheckInService: registerCheckIn(dto)

    CheckInService->>CheckInService: validate(dto)
    CheckInService->>Database: SELECT account, location,<br/>existing_check_in<br/>(for validation)
    Database-->>CheckInService: data

    alt Validation failed
        CheckInService-->>LocationController: BadRequestException /<br/>NotFoundException
        LocationController-->>Client: 400/404
    end

    CheckInService->>Database: calculateDistanceTo(currentLocation,<br/>locationCoordinates)
    Database-->>CheckInService: distance

    alt Distance > location.radiusMeters
        CheckInService-->>LocationController: BadRequestException<br/>("Not in acceptable range")
        LocationController-->>Client: 400 Bad Request
    end

    CheckInService->>Database: INSERT INTO check_ins<br/>(userProfileId, locationId,<br/>latitudeAtCheckIn, longitudeAtCheckIn)
    Database-->>CheckInService: savedCheckIn

    CheckInService->>Database: UPDATE user_profiles<br/>SET totalCheckIns = totalCheckIns + 1
    Database-->>CheckInService: updated

    CheckInService->>CheckInService: mapTo(CheckInResponseDto)
    CheckInService-->>LocationController: CheckInResponseDto
    LocationController-->>Client: 201 Created
```

**Figure 4:** Sequence diagram illustrating the flow of user check-in to a location, including validation (account setup, location visibility, duplicate check-in), distance verification, check-in creation, and user profile counter updates.

## 5. Process Users' Mission Flow

```mermaid
sequenceDiagram
    participant CheckInService as CheckInV2Service
    participant CheckInListener as CheckInCreatedListener
    participant MissionService as MissionProgressService
    participant Database

    Note over CheckInService: After successful check-in,<br/>CHECK_IN_CREATED_EVENT is emitted

    CheckInService->>CheckInListener: CHECK_IN_CREATED_EVENT<br/>(userId, locationId, checkInId)
    CheckInListener->>CheckInListener: handleEvent(event)

    CheckInListener->>Database: SELECT reward_points<br/>WHERE type = 'CHECK_IN'
    Database-->>CheckInListener: rewardPoint

    CheckInListener->>Database: INSERT INTO points_history<br/>(userId, points, type: CHECK_IN)
    Database-->>CheckInListener: created

    CheckInListener->>Database: INSERT/UPDATE user_location_profiles<br/>(userId, locationId)
    Database-->>CheckInListener: created/updated

    Note over CheckInListener: Mission processing happens<br/>automatically for active missions

    CheckInListener->>MissionService: updateMissionProgress(userId,<br/>locationId, checkInId)
    MissionService->>MissionService: validate user can do missions<br/>(check-in verification)

    MissionService->>Database: SELECT active_missions<br/>WHERE locationId AND startDate <= now <= endDate
    Database-->>MissionService: missions[]

    loop For each active mission
        MissionService->>Database: SELECT user_mission_progress<br/>WHERE userId AND missionId
        Database-->>MissionService: userProgress (or null)

        alt No progress exists
            MissionService->>Database: INSERT INTO user_mission_progress<br/>(userId, missionId, progress: 0)
            Database-->>MissionService: created
        end

        alt Mission not completed
            MissionService->>Database: UPDATE user_mission_progress<br/>SET progress = progress + 1
            Database-->>MissionService: updated

            alt Mission completed (progress >= target)
                MissionService->>Database: UPDATE user_mission_progress<br/>SET completed = true
                Database-->>MissionService: updated

                MissionService->>Database: INSERT INTO points_history<br/>(userId, reward, type: LOCATION_MISSION)
                Database-->>MissionService: created
            end
        end
    end

    MissionService-->>CheckInListener: processing complete
    CheckInListener-->>CheckInService: event handled
```

**Figure 5:** Sequence diagram illustrating the flow of processing users' missions automatically after check-in, including points awarding for check-in, user location profile creation, and mission progress tracking with completion rewards.

## 6. Business Process Voucher Flow

```mermaid
sequenceDiagram
    participant Client
    participant VoucherController as LocationVoucherBusinessController
    participant VoucherService as VoucherExchangeService
    participant Database

    Client->>VoucherController: POST /business/location-voucher/verify-code<br/>(VerifyVoucherCodeDto + JWT)
    VoucherController->>VoucherService: useVoucherByCode(userVoucherCode)

    VoucherService->>VoucherService: validate(userVoucherCode)
    VoucherService->>Database: SELECT voucher_exchange_history<br/>WHERE userVoucherCode<br/>WITH relations: voucher
    Database-->>VoucherService: exchangeRecord (or null)

    alt Voucher code not found
        VoucherService-->>VoucherController: {success: false,<br/>message: "Voucher code not found"}
        VoucherController-->>Client: 400 Bad Request
    end

    alt Voucher already used
        VoucherService-->>VoucherController: {success: false,<br/>message: "Already been used"}
        VoucherController-->>Client: 400 Bad Request
    end

    alt Voucher expired
        VoucherService-->>VoucherController: {success: false,<br/>message: "Voucher has expired"}
        VoucherController-->>Client: 400 Bad Request
    end

    VoucherService->>Database: UPDATE voucher_exchange_history<br/>SET usedAt = now()
    Database-->>VoucherService: updated

    VoucherService-->>VoucherController: {success: true,<br/>message: "Successfully used voucher",<br/>voucher: exchangeRecord}
    VoucherController-->>Client: 200 OK
```

**Figure 6:** Sequence diagram illustrating the flow of business processing voucher codes, including voucher code validation (existence, usage status, expiration), and marking voucher as used.

## 7. AI Creates Personal Itinerary Flow

```mermaid
sequenceDiagram
    participant Client
    participant JourneyController as JourneyPlannerController
    participant JourneyService as JourneyPlannerService
    participant OllamaService
    participant Database

    Client->>JourneyController: POST /journey/ai-powered<br/>(CreatePersonalJourneyDto + JWT)
    JourneyController->>JourneyService: createAIPoweredJourney(userId, dto)

    JourneyService->>JourneyService: validate(dto)<br/>Check OLLAMA_ENABLED
    JourneyService->>Database: SELECT user_profile, start_location,<br/>end_location (parallel queries)
    Database-->>JourneyService: userProfile, locations

    alt Validation failed
        JourneyService-->>JourneyController: BadRequestException /<br/>NotFoundException
        JourneyController-->>Client: 400/404
    end

    JourneyService->>Database: SELECT nearby_locations<br/>WITH tags (within radius)
    Database-->>JourneyService: nearbyCandidates[]

    JourneyService->>Database: SELECT wishlist_locations<br/>WHERE userId
    Database-->>JourneyService: wishlistLocations[]

    JourneyService->>JourneyService: build context<br/>(userPreferences, currentLocation,<br/>numberOfLocations, candidates)

    JourneyService->>OllamaService: generateJourneyWithDBAccess(context)

    Note over OllamaService: AI Agent with Database Tools

    OllamaService->>OllamaService: buildAgentPrompt(context)

    loop AI Planning Process
        OllamaService->>OllamaService: call LLM with database tools

        alt AI needs more location data
            OllamaService->>Database: SELECT locations<br/>WHERE conditions (via AI tool calls)
            Database-->>OllamaService: locations[]
        end

        alt AI needs tag information
            OllamaService->>Database: SELECT tags<br/>WHERE locationId (via AI tool calls)
            Database-->>OllamaService: tags[]
        end

        OllamaService->>OllamaService: AI analyzes data<br/>and makes decisions
    end

    OllamaService-->>JourneyService: AIJourneyResponse<br/>{reasoning, tips, suggestedLocationIds,<br/>locationActivities}

    JourneyService->>JourneyService: processAIResponse<br/>(filter, prioritize, optimize route)

    JourneyService->>JourneyService: optimizeRouteWithMetrics<br/>(calculate travel times, distances)

    JourneyService->>JourneyService: buildFinalResponse<br/>(locations, route, AI insights)

    JourneyService-->>JourneyController: AIJourneyResponseDto<br/>{locations, route, totalDistance,<br/>estimatedDuration, reasoning, tips}
    JourneyController-->>Client: 200 OK
```

**Figure 7:** Sequence diagram illustrating the flow of AI creating personal itinerary, including user preference analysis, location data gathering, AI agent processing with database access, route optimization, and comprehensive journey response generation.

## 8. Get Free Vouchers List Flow

```mermaid
sequenceDiagram
    participant Client
    participant VoucherController as LocationVoucherUserController
    participant VoucherService as LocationVoucherService
    participant Database

    Client->>VoucherController: GET /user/location-voucher/free<br/>(PaginateQuery + JWT)
    VoucherController->>VoucherService: getFreeAvailableVouchers(query)

    VoucherService->>VoucherService: validate(query)
    VoucherService->>Database: SELECT vouchers<br/>LEFT JOIN locations<br/>WHERE pricePoint = 0<br/>AND startDate <= now<br/>AND endDate >= now<br/>AND maxQuantity > 0<br/>ORDER BY createdAt DESC
    Database-->>VoucherService: vouchers[] with full location data

    VoucherService->>VoucherService: paginate(vouchers, query)<br/>map response (keep only location.name)
    VoucherService-->>VoucherController: Paginated<VoucherWithLocationNameDto>
    VoucherController-->>Client: 200 OK
```

**Figure 8:** Sequence diagram illustrating the flow of getting free vouchers list, including filtering by price point (0), active date range, availability, and returning vouchers with minimal location information (id, name only).

## 9. Get Exchange Vouchers List Flow

```mermaid
sequenceDiagram
    participant Client
    participant VoucherController as LocationVoucherUserController
    participant VoucherService as LocationVoucherService
    participant Database

    Client->>VoucherController: GET /user/location-voucher/available<br/>(PaginateQuery + JWT)
    VoucherController->>VoucherService: getAllAvailableVouchers(query)

    VoucherService->>VoucherService: validate(query)
    VoucherService->>Database: SELECT vouchers<br/>LEFT JOIN locations<br/>WHERE startDate <= now<br/>AND endDate >= now<br/>AND maxQuantity > 0<br/>ORDER BY createdAt DESC
    Database-->>VoucherService: vouchers[] with location data

    VoucherService->>VoucherService: paginate(vouchers, query)<br/>map to minimal response (voucher + location.name only)
    VoucherService-->>VoucherController: Paginated<VoucherWithLocationNameDto>
    VoucherController-->>Client: 200 OK
```

**Figure 9:** Sequence diagram illustrating the flow of getting all available vouchers for exchange, including both free and paid vouchers that are active and available, with minimal location information (id, name only).

## 10. Get My Vouchers List Flow

```mermaid
sequenceDiagram
    participant Client
    participant ExchangeController as VoucherExchangeUserController
    participant ExchangeService as VoucherExchangeService
    participant Database

    Client->>ExchangeController: GET /user/voucher-exchange/vouchers<br/>(JWT)
    ExchangeController->>ExchangeService: getUserVouchers(userId)

    ExchangeService->>Database: SELECT user_location_voucher_exchange_history<br/>LEFT JOIN location_vouchers<br/>LEFT JOIN locations<br/>WHERE userProfileId = userId<br/>AND usedAt IS NULL<br/>ORDER BY exchangedAt DESC
    Database-->>ExchangeService: exchangeHistory[] with voucher and location data

    ExchangeService->>ExchangeService: filter available vouchers<br/>map to minimal response (voucher + location.name only)
    ExchangeService-->>ExchangeController: UserVoucherResponseDto[]<br/>(voucher + location name only)
    ExchangeController-->>Client: 200 OK
```

**Figure 10:** Sequence diagram illustrating the flow of getting user's owned vouchers, including filtering for unused vouchers and returning voucher information with minimal location data (id, name only).
