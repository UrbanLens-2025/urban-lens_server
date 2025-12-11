# Sequence Diagrams - User, Post, Itinerary, Mission, Voucher Features

## 1. Create Post Flow

```mermaid
---
config:
  theme: redux
  look: classic
---
sequenceDiagram
    participant User
    participant Frontend
    participant PostController as :PostUserController
    participant PostService as :PostService
    participant PostRepo as :PostRepository
    participant FileService as :FileStorageService
    participant AccountRepo as :AccountRepository
    participant CheckInRepo as :CheckInRepository
    participant LocationRepo as :LocationRepository
    participant EventRepo as :EventRepository
    participant UserProfileRepo as :UserProfileRepository
    participant Database

    User->>Frontend: 1. Submit post creation form
    activate Frontend
    Frontend->>PostController: 2. POST /user/post<br/>(CreatePostDto + JWT)
    activate PostController
    PostController->>PostService: 3. createPost(dto)
    activate PostService

    PostService->>AccountRepo: 4. findOneOrFail()<br/>(validate account)
    activate AccountRepo
    AccountRepo->>Database: 5. Query account by ID
    activate Database
    Database-->>AccountRepo: 6. Return account
    deactivate Database
    AccountRepo-->>PostService: 7. Return account
    deactivate AccountRepo

    alt Post has locationId
        PostService->>CheckInRepo: 8. exists()<br/>(check if user checked in)
        activate CheckInRepo
        CheckInRepo->>Database: 9. Query check-in
        activate Database
        Database-->>CheckInRepo: 10. Return exists result
        deactivate Database
        CheckInRepo-->>PostService: 11. Return exists result
        deactivate CheckInRepo
    end

    alt Image/Video URLs provided
        PostService->>FileService: 12. confirmUpload(imageUrls/videoIds)
        activate FileService
        FileService->>Database: 13. Update file status
        activate Database
        Database-->>FileService: 14. Return updated files
        deactivate Database
        FileService-->>PostService: 15. Return public files
        deactivate FileService
    end

    PostService->>PostRepo: 16. save(postEntity)
    activate PostRepo
    PostRepo->>Database: 17. INSERT INTO posts
    activate Database
    Database-->>PostRepo: 18. Return saved post
    deactivate Database
    PostRepo-->>PostService: 19. Return saved post
    deactivate PostRepo

    alt Post type is REVIEW
        PostService->>PostRepo: 20. Query reviews<br/>WHERE locationId/eventId AND type=REVIEW
        activate PostRepo
        PostRepo->>Database: 21. Query reviews
        activate Database
        Database-->>PostRepo: 22. Return reviews[]
        deactivate Database
        PostRepo-->>PostService: 23. Return reviews[]
        deactivate PostRepo

        alt Has locationId
            PostService->>LocationRepo: 24. update()<br/>SET totalReviews, averageRating
            activate LocationRepo
            LocationRepo->>Database: 25. UPDATE locations
            activate Database
            Database-->>LocationRepo: 26. Return updated
            deactivate Database
            LocationRepo-->>PostService: 27. Return updated
            deactivate LocationRepo
        else Has eventId
            PostService->>EventRepo: 28. update()<br/>SET totalReviews, averageRating
            activate EventRepo
            EventRepo->>Database: 29. UPDATE events
            activate Database
            Database-->>EventRepo: 30. Return updated
            deactivate Database
            EventRepo-->>PostService: 31. Return updated
            deactivate EventRepo
        end

        PostService->>UserProfileRepo: 32. increment()<br/>SET totalReviews = totalReviews + 1
        activate UserProfileRepo
        UserProfileRepo->>Database: 33. UPDATE user_profiles
        activate Database
        Database-->>UserProfileRepo: 34. Return updated
        deactivate Database
        UserProfileRepo-->>PostService: 35. Return updated
        deactivate UserProfileRepo
    else Post type is BLOG
        PostService->>UserProfileRepo: 36. increment()<br/>SET totalBlogs = totalBlogs + 1
        activate UserProfileRepo
        UserProfileRepo->>Database: 37. UPDATE user_profiles
        activate Database
        Database-->>UserProfileRepo: 38. Return updated
        deactivate Database
        UserProfileRepo-->>PostService: 39. Return updated
        deactivate UserProfileRepo
    end

    PostService->>PostRepo: 40. Query post with relations<br/>(JOIN accounts, locations)
    activate PostRepo
    PostRepo->>Database: 41. Query post with JOINs
    activate Database
    Database-->>PostRepo: 42. Return createdPost
    deactivate Database
    PostRepo-->>PostService: 43. Return createdPost
    deactivate PostRepo

    PostService->>PostService: 44. mapRawPostToDto(createdPost)
    PostService->>PostService: 45. Emit POST_CREATED_EVENT
    PostService-->>PostController: 46. Return PostResponseDto
    deactivate PostService
    PostController-->>Frontend: 47. Return PostResponseDto
    deactivate PostController
    Frontend-->>User: 48. Show success message
    deactivate Frontend
```

**Figure 1:** Sequence diagram illustrating the flow of creating a new post, including database operations for validation, post creation, analytics updates, and user profile counters.

## 2. Create Mission Flow

```mermaid
---
config:
  theme: redux
  look: classic
---
sequenceDiagram
    participant User
    participant Frontend
    participant MissionController as :LocationMissionBusinessController
    participant MissionService as :LocationMissionService
    participant MissionRepo as :LocationMissionRepository
    participant LocationRepo as :LocationRepository
    participant Database

    User->>Frontend: 1. Submit mission creation form
    activate Frontend
    Frontend->>MissionController: 2. POST /business/location-mission/:locationId<br/>(CreateLocationMissionDto + JWT)
    activate MissionController
    MissionController->>MissionService: 3. createMission(locationId, dto)
    activate MissionService

    MissionService->>LocationRepo: 4. findOneByOrFail()<br/>(validate location)
    activate LocationRepo
    LocationRepo->>Database: 5. Query location by ID
    activate Database
    Database-->>LocationRepo: 6. Return location
    deactivate Database
    LocationRepo-->>PostService: 7. Return location
    deactivate LocationRepo

    MissionService->>MissionService: 8. validate(dto)<br/>(date range, target, reward)

    alt Validation failed
        MissionService-->>MissionController: 9. Return BadRequestException
        MissionController-->>Frontend: 10. Return 400 Bad Request
        Frontend-->>User: 11. Show error message
    else Validation passed
        MissionService->>MissionRepo: 12. save(missionEntity)
        activate MissionRepo
        MissionRepo->>Database: 13. INSERT INTO location_missions
        activate Database
        Database-->>MissionRepo: 14. Return saved mission
        deactivate Database
        MissionRepo-->>MissionService: 15. Return saved mission
        deactivate MissionRepo

        MissionService->>MissionService: 16. map to LocationMissionResponseDto
        MissionService-->>MissionController: 17. Return LocationMissionResponseDto
        deactivate MissionService
        MissionController-->>Frontend: 18. Return LocationMissionResponseDto
        deactivate MissionController
        Frontend-->>User: 19. Show success message
        deactivate Frontend
    end
```

**Figure 2:** Sequence diagram illustrating the flow of creating a location mission by a business owner, including location existence verification, date range validation, and mission creation.

## 3. Scan QR Code Flow

```mermaid
---
config:
  theme: redux
  look: classic
---
sequenceDiagram
    participant User
    participant Frontend
    participant QRController as :QRCodeScanUserController
    participant QRService as :QRCodeScanService
    participant OneTimeQRRepo as :OneTimeQRCodeRepository
    participant MissionRepo as :LocationMissionRepository
    participant ProgressRepo as :UserMissionProgressRepository
    participant LogRepo as :LocationMissionLogRepository
    participant UserLocationProfileService as :UserLocationProfileService
    participant PointsService as :UserPointsService
    participant Database

    User->>Frontend: 1. Scan QR code
    activate Frontend
    Frontend->>QRController: 2. POST /user/qr-scan/scan<br/>(ScanQRCodeDto + JWT)
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
            QRController-->>Frontend: 28. Return 200 OK
            Frontend-->>User: 29. Show message
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
            QRController-->>Frontend: 48. Return QRCodeScanResponseDto
            deactivate QRController
            Frontend-->>User: 49. Show success message
            deactivate Frontend
        end
    end
```

**Figure 3:** Sequence diagram illustrating the flow of scanning a QR code to process missions for users, including validation, mission progress tracking, points awarding, and response building.

## 4. Check-in to Location Flow

```mermaid
---
config:
  theme: redux
  look: classic
---
sequenceDiagram
    participant User
    participant Frontend
    participant LocationController as :LocationUserController
    participant CheckInService as :CheckInV2Service
    participant CheckInRepo as :CheckInRepository
    participant LocationRepo as :LocationRepository
    participant AccountRepo as :AccountRepository
    participant UserProfileRepo as :UserProfileRepository
    participant EventEmitter
    participant Database

    User->>Frontend: 1. Request check-in
    activate Frontend
    Frontend->>LocationController: 2. POST /user/locations/:locationId/check-in<br/>(RegisterCheckInDto + JWT)
    activate LocationController
    LocationController->>CheckInService: 3. registerCheckIn(dto)
    activate CheckInService

    CheckInService->>AccountRepo: 4. findOneOrFail()<br/>(validate account)
    activate AccountRepo
    AccountRepo->>Database: 5. Query account by ID
    activate Database
    Database-->>AccountRepo: 6. Return account
    deactivate Database
    AccountRepo-->>CheckInService: 7. Return account
    deactivate AccountRepo

    CheckInService->>CheckInService: 8. validate account.canPerformActions()

    CheckInService->>LocationRepo: 9. findOneByOrFail()<br/>(validate location)
    activate LocationRepo
    LocationRepo->>Database: 10. Query location by ID
    activate Database
    Database-->>LocationRepo: 11. Return location
    deactivate Database
    LocationRepo-->>CheckInService: 12. Return location
    deactivate LocationRepo

    CheckInService->>CheckInService: 13. validate location.canBeViewedOnMap()

    CheckInService->>CheckInRepo: 14. exists()<br/>(check duplicate check-in)
    activate CheckInRepo
    CheckInRepo->>Database: 15. Query check_ins
    activate Database
    Database-->>CheckInRepo: 16. Return exists result
    deactivate Database
    CheckInRepo-->>CheckInService: 17. Return exists result
    deactivate CheckInRepo

    CheckInService->>LocationRepo: 18. calculateDistanceTo()<br/>(currentLocation, locationCoordinates)
    activate LocationRepo
    LocationRepo->>Database: 19. Calculate distance using PostGIS
    activate Database
    Database-->>LocationRepo: 20. Return distance
    deactivate Database
    LocationRepo-->>CheckInService: 21. Return distance
    deactivate LocationRepo

    alt Distance > location.radiusMeters
        CheckInService-->>LocationController: 22. Return BadRequestException<br/>("Not in acceptable range")
        LocationController-->>Frontend: 23. Return 400 Bad Request
        Frontend-->>User: 24. Show error message
    else Distance <= location.radiusMeters
        CheckInService->>CheckInRepo: 25. save(checkInEntity)
        activate CheckInRepo
        CheckInRepo->>Database: 26. INSERT INTO check_ins
        activate Database
        Database-->>CheckInRepo: 27. Return saved check-in
        deactivate Database
        CheckInRepo-->>CheckInService: 28. Return saved check-in
        deactivate CheckInRepo

        CheckInService->>UserProfileRepo: 29. increment()<br/>SET totalCheckIns = totalCheckIns + 1
        activate UserProfileRepo
        UserProfileRepo->>Database: 30. UPDATE user_profiles
        activate Database
        Database-->>UserProfileRepo: 31. Return updated
        deactivate Database
        UserProfileRepo-->>CheckInService: 32. Return updated
        deactivate UserProfileRepo

        CheckInService->>EventEmitter: 33. emit(CHECK_IN_CREATED_EVENT)
        activate EventEmitter
        EventEmitter-->>CheckInService: 34. Event emitted
        deactivate EventEmitter

        CheckInService->>CheckInService: 35. mapTo(CheckInResponseDto)
        CheckInService-->>LocationController: 36. Return CheckInResponseDto
        deactivate CheckInService
        LocationController-->>Frontend: 37. Return CheckInResponseDto
        deactivate LocationController
        Frontend-->>User: 38. Show success message
        deactivate Frontend
    end
```

**Figure 4:** Sequence diagram illustrating the flow of user check-in to a location, including validation (account setup, location visibility, duplicate check-in), distance verification, check-in creation, and user profile counter updates.

## 5. Process Users' Mission Flow (After Check-in)

```mermaid
---
config:
  theme: redux
  look: classic
---
sequenceDiagram
    participant CheckInService as :CheckInV2Service
    participant EventEmitter
    participant CheckInListener as :CheckInCreatedListener
    participant PointsService as :UserPointsService
    participant UserLocationProfileService as :UserLocationProfileService
    participant MissionService as :MissionProgressService
    participant RewardPointsRepo as :RewardPointsRepository
    participant PointsHistoryRepo as :PointsHistoryRepository
    participant UserLocationProfileRepo as :UserLocationProfileRepository
    participant MissionRepo as :LocationMissionRepository
    participant ProgressRepo as :UserMissionProgressRepository
    participant Database

    CheckInService->>EventEmitter: 1. emit(CHECK_IN_CREATED_EVENT)<br/>(userId, locationId, checkInId)
    activate EventEmitter
    EventEmitter->>CheckInListener: 2. CHECK_IN_CREATED_EVENT
    deactivate EventEmitter
    activate CheckInListener

    CheckInListener->>RewardPointsRepo: 3. findOne()<br/>WHERE type = 'CHECK_IN'
    activate RewardPointsRepo
    RewardPointsRepo->>Database: 4. Query reward_points
    activate Database
    Database-->>RewardPointsRepo: 5. Return rewardPoint
    deactivate Database
    RewardPointsRepo-->>CheckInListener: 6. Return rewardPoint
    deactivate RewardPointsRepo

    CheckInListener->>PointsService: 7. addPoints()<br/>type: CHECK_IN
    activate PointsService
    PointsService->>PointsHistoryRepo: 8. save()<br/>INSERT INTO points_history
    activate PointsHistoryRepo
    PointsHistoryRepo->>Database: 9. INSERT INTO points_history
    activate Database
    Database-->>PointsHistoryRepo: 10. Return created
    deactivate Database
    PointsHistoryRepo-->>PointsService: 11. Return created
    deactivate PointsHistoryRepo
    PointsService-->>CheckInListener: 12. Return success
    deactivate PointsService

    CheckInListener->>UserLocationProfileService: 13. createOrUpdate()<br/>(userId, locationId)
    activate UserLocationProfileService
    UserLocationProfileService->>UserLocationProfileRepo: 14. save()<br/>INSERT/UPDATE user_location_profiles
    activate UserLocationProfileRepo
    UserLocationProfileRepo->>Database: 15. INSERT/UPDATE user_location_profiles
    activate Database
    Database-->>UserLocationProfileRepo: 16. Return created/updated
    deactivate Database
    UserLocationProfileRepo-->>UserLocationProfileService: 17. Return profile
    deactivate UserLocationProfileRepo
    UserLocationProfileService-->>CheckInListener: 18. Return profile
    deactivate UserLocationProfileService


    CheckInListener->>MissionService: 19. updateMissionProgress(userId,<br/>locationId, checkInId)
    activate MissionService

    MissionService->>MissionRepo: 20. find()<br/>WHERE locationId AND startDate <= now <= endDate
    activate MissionRepo
    MissionRepo->>Database: 21. Query active_missions
    activate Database
    Database-->>MissionRepo: 22. Return missions[]
    deactivate Database
    MissionRepo-->>MissionService: 23. Return missions[]
    deactivate MissionRepo

    loop For each active mission
        MissionService->>ProgressRepo: 24. findOne()<br/>WHERE userId AND missionId
        activate ProgressRepo
        ProgressRepo->>Database: 25. Query user_mission_progress
        activate Database
        Database-->>ProgressRepo: 26. Return userProgress (or null)
        deactivate Database
        ProgressRepo-->>MissionService: 27. Return userProgress
        deactivate ProgressRepo

        alt No progress exists
            MissionService->>ProgressRepo: 28. save()<br/>INSERT INTO user_mission_progress<br/>(progress: 0)
            activate ProgressRepo
            ProgressRepo->>Database: 29. INSERT INTO user_mission_progress
            activate Database
            Database-->>ProgressRepo: 30. Return created
            deactivate Database
            ProgressRepo-->>MissionService: 31. Return created
            deactivate ProgressRepo
        end

        alt Mission not completed
            MissionService->>ProgressRepo: 32. save()<br/>UPDATE progress = progress + 1
            activate ProgressRepo
            ProgressRepo->>Database: 33. UPDATE user_mission_progress
            activate Database
            Database-->>ProgressRepo: 34. Return updated
            deactivate Database
            ProgressRepo-->>MissionService: 35. Return updated
            deactivate ProgressRepo

            alt Mission completed (progress >= target)
                MissionService->>ProgressRepo: 36. save()<br/>UPDATE completed = true
                activate ProgressRepo
                ProgressRepo->>Database: 37. UPDATE user_mission_progress
                activate Database
                Database-->>ProgressRepo: 38. Return updated
                deactivate Database
                ProgressRepo-->>MissionService: 39. Return updated
                deactivate ProgressRepo

                MissionService->>PointsService: 40. addPoints()<br/>type: LOCATION_MISSION
                activate PointsService
                PointsService->>PointsHistoryRepo: 41. save()<br/>INSERT INTO points_history
                activate PointsHistoryRepo
                PointsHistoryRepo->>Database: 42. INSERT INTO points_history
                activate Database
                Database-->>PointsHistoryRepo: 43. Return created
                deactivate Database
                PointsHistoryRepo-->>PointsService: 44. Return created
                deactivate PointsHistoryRepo
                PointsService-->>MissionService: 45. Return success
                deactivate PointsService
            end
        end
    end

    MissionService-->>CheckInListener: 46. Processing complete
    deactivate MissionService
    CheckInListener-->>CheckInService: 47. Event handled
    deactivate CheckInListener
```

**Figure 5:** Sequence diagram illustrating the flow of processing users' missions automatically after check-in, including points awarding for check-in, user location profile creation, and mission progress tracking with completion rewards.

## 6. Business Process Voucher Flow

```mermaid
---
config:
  theme: redux
  look: classic
---
sequenceDiagram
    participant User
    participant Frontend
    participant VoucherController as :LocationVoucherBusinessController
    participant VoucherService as :VoucherExchangeService
    participant ExchangeHistoryRepo as :UserLocationVoucherExchangeHistoryRepository
    participant VoucherRepo as :LocationVoucherRepository
    participant Database

    User->>Frontend: 1. Submit voucher code
    activate Frontend
    Frontend->>VoucherController: 2. POST /business/location-voucher/verify-code<br/>(VerifyVoucherCodeDto + JWT)
    activate VoucherController
    VoucherController->>VoucherService: 3. useVoucherByCode(userVoucherCode)
    activate VoucherService

    VoucherService->>ExchangeHistoryRepo: 4. findOne()<br/>WHERE userVoucherCode<br/>WITH relations: voucher
    activate ExchangeHistoryRepo
    ExchangeHistoryRepo->>Database: 5. Query voucher_exchange_history
    activate Database
    Database-->>ExchangeHistoryRepo: 6. Return exchangeRecord (or null)
    deactivate Database
    ExchangeHistoryRepo-->>VoucherService: 7. Return exchangeRecord
    deactivate ExchangeHistoryRepo

    alt Voucher code not found
        VoucherService-->>VoucherController: 8. Return {success: false,<br/>message: "Voucher code not found"}
        VoucherController-->>Frontend: 9. Return 400 Bad Request
        Frontend-->>User: 10. Show error message
    else Voucher already used
        VoucherService-->>VoucherController: 11. Return {success: false,<br/>message: "Already been used"}
        VoucherController-->>Frontend: 12. Return 400 Bad Request
        Frontend-->>User: 13. Show error message
    else Voucher expired
        VoucherService-->>VoucherController: 14. Return {success: false,<br/>message: "Voucher has expired"}
        VoucherController-->>Frontend: 15. Return 400 Bad Request
        Frontend-->>User: 16. Show error message
    else Voucher valid
        VoucherService->>ExchangeHistoryRepo: 17. update()<br/>SET usedAt = now()
        activate ExchangeHistoryRepo
        ExchangeHistoryRepo->>Database: 18. UPDATE voucher_exchange_history
        activate Database
        Database-->>ExchangeHistoryRepo: 19. Return updated
        deactivate Database
        ExchangeHistoryRepo-->>VoucherService: 20. Return updated
        deactivate ExchangeHistoryRepo

        VoucherService-->>VoucherController: 21. Return {success: true,<br/>message: "Successfully used voucher",<br/>voucher: exchangeRecord}
        deactivate VoucherService
        VoucherController-->>Frontend: 22. Return 200 OK
        deactivate VoucherController
        Frontend-->>User: 23. Show success message
        deactivate Frontend
    end
```

**Figure 6:** Sequence diagram illustrating the flow of business processing voucher codes, including voucher code validation (existence, usage status, expiration), and marking voucher as used.

## 7. AI Creates Personal Itinerary Flow

```mermaid
---
config:
  theme: redux
  look: classic
---
sequenceDiagram
    participant User
    participant Frontend
    participant JourneyController as :JourneyPlannerController
    participant JourneyService as :JourneyPlannerService
    participant UserProfileRepo as :UserProfileRepository
    participant LocationRepo as :LocationRepository
    participant OllamaService as :OllamaService
    participant GoogleMapsService as :GoogleMapsService
    participant Database

    User->>Frontend: 1. Request AI itinerary
    activate Frontend
    Frontend->>JourneyController: 2. POST /journey/ai-powered<br/>(CreatePersonalJourneyDto + JWT)
    activate JourneyController
    JourneyController->>JourneyService: 3. createAIPoweredJourney(userId, dto)
    activate JourneyService

    JourneyService->>JourneyService: 4. validate(dto)<br/>Check OLLAMA_ENABLED

    JourneyService->>UserProfileRepo: 5. findByAccountId(userId)
    activate UserProfileRepo
    UserProfileRepo->>Database: 6. Query user_profile
    activate Database
    Database-->>UserProfileRepo: 7. Return userProfile
    deactivate Database
    UserProfileRepo-->>JourneyService: 8. Return userProfile
    deactivate UserProfileRepo

    alt startLocationId provided
        JourneyService->>LocationRepo: 9. findByIds([startLocationId])
        activate LocationRepo
        LocationRepo->>Database: 10. Query locations
        activate Database
        Database-->>LocationRepo: 11. Return locations[]
        deactivate Database
        LocationRepo-->>JourneyService: 12. Return startLocation
        deactivate LocationRepo
    else currentLatitude/Longitude provided
        JourneyService->>LocationRepo: 13. findNearestLocation()<br/>(within 50km)
        activate LocationRepo
        LocationRepo->>Database: 14. Query nearest location
        activate Database
        Database-->>LocationRepo: 15. Return nearest location
        deactivate Database
        LocationRepo-->>JourneyService: 16. Return startLocation
        deactivate LocationRepo
    end

    JourneyService->>LocationRepo: 17. findNearbyWithTags()<br/>(within radius, with tags)
    activate LocationRepo
    LocationRepo->>Database: 18. Query nearby locations WITH tags
    activate Database
    Database-->>LocationRepo: 19. Return nearbyCandidates[]
    deactivate Database
    LocationRepo-->>JourneyService: 20. Return nearbyCandidates[]
    deactivate LocationRepo

    JourneyService->>JourneyService: 21. build context<br/>(userPreferences, currentLocation,<br/>numberOfLocations, candidates)

    JourneyService->>OllamaService: 22. generateJourneyWithDBAccess(context)
    activate OllamaService


    OllamaService->>OllamaService: 23. buildAgentPrompt(context)<br/>getSystemPromptWithTools()

    OllamaService->>OllamaService: 24. call LLM<br/>(with database tools)

    alt AI calls query_nearby_locations tool
        OllamaService->>LocationRepo: 25. Query locations<br/>via AI tool call
        activate LocationRepo
        LocationRepo->>Database: 26. Query locations WHERE conditions
        activate Database
        Database-->>LocationRepo: 27. Return locations[]
        deactivate Database
        LocationRepo-->>OllamaService: 28. Return locations[]
        deactivate LocationRepo
    end

    OllamaService->>OllamaService: 29. parseAIResponse()<br/>(REASONING, TIPS, LOCATION_IDS, ACTIVITIES)

    OllamaService-->>JourneyService: 30. Return AIJourneyResponse<br/>{reasoning, tips, suggestedLocationIds,<br/>locationActivities}
    deactivate OllamaService

    JourneyService->>JourneyService: 31. processAIResponse()<br/>(filter, prioritize)

    JourneyService->>GoogleMapsService: 32. optimizeRouteWithMetrics()<br/>(calculate travel times, distances)
    activate GoogleMapsService
    GoogleMapsService->>GoogleMapsService: 33. Call Google Maps API<br/>(directions, distance matrix)
    GoogleMapsService-->>JourneyService: 34. Return route metrics
    deactivate GoogleMapsService

    JourneyService->>JourneyService: 35. buildFinalResponse()<br/>(locations, route, AI insights)

    JourneyService-->>JourneyController: 36. Return AIJourneyResponseDto<br/>{locations, route, totalDistance,<br/>estimatedDuration, reasoning, tips}
    deactivate JourneyService
    JourneyController-->>Frontend: 37. Return AIJourneyResponseDto
    deactivate JourneyController
    Frontend-->>User: 38. Show itinerary
    deactivate Frontend
```

**Figure 7:** Sequence diagram illustrating the flow of AI creating personal itinerary, including user preference analysis, location data gathering, AI agent processing with database access, route optimization, and comprehensive journey response generation.
