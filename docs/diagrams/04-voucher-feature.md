# Voucher Feature - Class & Sequence Diagrams

## Class Diagram

```mermaid
classDiagram
    class LocationVoucherEntity {
        +UUID id
        +UUID locationId
        +String title
        +String description
        +String voucherCode
        +String imageUrl
        +Integer pricePoint
        +Integer maxQuantity
        +Integer userRedeemedLimit
        +LocationVoucherType voucherType
        +Date startDate
        +Date endDate
        +Date createdAt
        +Date updatedAt
        +isAvailable() Boolean
        +isExpired() Boolean
        +isActive() Boolean
    }

    class UserLocationVoucherExchangeHistoryEntity {
        +UUID id
        +UUID voucherId
        +UUID userProfileId
        +Integer pointSpent
        +String userVoucherCode
        +Date usedAt
        +Date createdAt
        +isUsed() Boolean
        +isExpired() Boolean
        +isValid() Boolean
    }

    class UserProfileEntity {
        +UUID accountId
        +Integer points
        +UUID rankId
        +addPoints(amount) void
        +deductPoints(amount) void
        +hasEnoughPoints(amount) Boolean
    }

    class LocationEntity {
        +UUID id
        +String name
        +String addressLine
        +Decimal latitude
        +Decimal longitude
        +UUID businessId
    }

    class ILocationVoucherService {
        <<interface>>
        +createVoucher(locationId, dto) Promise~Voucher~
        +getVouchersByLocation(locationId, query) Promise~Paginated~
        +getVoucherById(voucherId) Promise~Voucher~
        +updateVoucher(voucherId, dto) Promise~Voucher~
        +deleteVoucher(voucherId) Promise~void~
        +getFreeAvailableVouchers(query) Promise~Paginated~
    }

    class IVoucherExchangeService {
        <<interface>>
        +exchangeVoucher(userId, voucherId) Promise~UserVoucher~
        +getUserVouchers(userId) Promise~UserVoucher[]~
        +useVoucher(userId, voucherCode) Promise~void~
    }

    class VoucherExchangeService {
        -UserLocationVoucherExchangeHistoryRepository voucherHistoryRepository
        -UserProfileRepository userProfileRepository
        -LocationVoucherRepository voucherRepository
        +exchangeVoucher(userId, voucherId) Promise~UserVoucher~
        +getUserVouchers(userId) Promise~UserVoucher[]~
        +useVoucher(userId, voucherCode) Promise~void~
    }

    class LocationVoucherUserController {
        -ILocationVoucherService locationVoucherService
        +getFreeAvailableVouchers(query, user) Promise~Paginated~
        +getVouchersByLocation(locationId, query, user) Promise~Paginated~
        +getVoucherById(voucherId, user) Promise~Voucher~
    }

    class VoucherUserController {
        -IVoucherExchangeService voucherExchangeService
        +exchangeVoucher(voucherId, user) Promise~UserVoucher~
        +getUserVouchers(user) Promise~UserVoucher[]~
    }

    class LocationMissionBusinessController {
        -IVoucherExchangeService voucherExchangeService
        +useVoucher(voucherCode, user) Promise~void~
    }

    %% Relationships
    LocationEntity ||--o{ LocationVoucherEntity : "has"
    LocationVoucherEntity ||--o{ UserLocationVoucherExchangeHistoryEntity : "exchanged as"
    UserProfileEntity ||--o{ UserLocationVoucherExchangeHistoryEntity : "exchanges"

    ILocationVoucherService <|.. LocationVoucherService
    IVoucherExchangeService <|.. VoucherExchangeService
    LocationVoucherUserController --> ILocationVoucherService
    VoucherUserController --> IVoucherExchangeService
    LocationMissionBusinessController --> IVoucherExchangeService
```

## Sequence Diagram: Exchange Voucher

### Class Diagram: Exchange Voucher

```mermaid
classDiagram
    class VoucherUserController {
        +exchangeVoucher(voucherId, user) Promise~UserVoucher~
    }
    class VoucherExchangeService {
        +exchangeVoucher(userId, voucherId) Promise~UserVoucher~
    }
    class LocationVoucherRepository {
        +findOne(id) Voucher
        +decrementQuantity(id) void
    }
    class UserProfileRepository {
        +getUserProfile(userId) UserProfile
        +deductPoints(userId, amount) void
    }
    class UserLocationVoucherExchangeHistoryRepository {
        +countUserRedemptions(userId, voucherId) number
        +create(entity) UserVoucherHistory
    }
    class LocationVoucherEntity {
        +UUID id
        +Integer pricePoint
        +Integer maxQuantity
        +Date startDate
        +Date endDate
    }

    VoucherUserController --> VoucherExchangeService
    VoucherExchangeService --> LocationVoucherRepository
    VoucherExchangeService --> UserProfileRepository
    VoucherExchangeService --> UserLocationVoucherExchangeHistoryRepository
    LocationVoucherRepository --> LocationVoucherEntity
```

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

    alt Voucher not found
        VoucherExchangeService-->>VoucherController: NotFoundException
        VoucherController-->>Client: 404 Not Found
    else Voucher not active or expired
        VoucherExchangeService-->>VoucherController: BadRequestException("Voucher not available")
        VoucherController-->>Client: 400 Bad Request
    else Voucher maxQuantity = 0
        VoucherExchangeService-->>VoucherController: BadRequestException("Voucher out of stock")
        VoucherController-->>Client: 400 Bad Request
    end

    VoucherExchangeService->>UserProfileRepository: getUserProfile(userId)
    UserProfileRepository-->>VoucherExchangeService: userProfile

    alt Insufficient points
        VoucherExchangeService-->>VoucherController: BadRequestException("Insufficient points")
        VoucherController-->>Client: 400 Bad Request
    end

    alt Check user redeemed limit
        VoucherExchangeService->>VoucherHistoryRepository: countUserRedemptions(userId, voucherId)
        VoucherHistoryRepository-->>VoucherExchangeService: redemptionCount

        alt Exceeded user limit
            VoucherExchangeService-->>VoucherController: BadRequestException("User redemption limit exceeded")
            VoucherController-->>Client: 400 Bad Request
        end
    end

    VoucherExchangeService->>UserProfileRepository: deductPoints(userId, voucher.pricePoint)
    UserProfileRepository-->>VoucherExchangeService: updated

    VoucherExchangeService->>VoucherRepository: decrementQuantity(voucherId)
    VoucherRepository-->>VoucherExchangeService: updated

    VoucherExchangeService->>VoucherHistoryRepository: create(UserLocationVoucherExchangeHistoryEntity)
    Note over VoucherHistoryRepository: Generate unique userVoucherCode<br/>pointSpent = voucher.pricePoint<br/>usedAt = null
    VoucherHistoryRepository-->>VoucherExchangeService: voucherHistory

    VoucherExchangeService-->>VoucherController: UserVoucherResponseDto
    VoucherController-->>Client: 200 OK
```

## Sequence Diagram: Get User Available Vouchers

### Class Diagram: Get User Available Vouchers

```mermaid
classDiagram
    class VoucherUserController {
        +getUserVouchers(user) Promise~UserVoucher[]~
    }
    class VoucherExchangeService {
        +getUserVouchers(userId) Promise~UserVoucher[]~
    }
    class UserLocationVoucherExchangeHistoryRepository {
        +findAvailableByUser(userId) UserVoucherHistory[]
    }
    class LocationVoucherEntity {
        +UUID id
        +UUID locationId
        +Integer pricePoint
        +Date endDate
    }

    VoucherUserController --> VoucherExchangeService
    VoucherExchangeService --> UserLocationVoucherExchangeHistoryRepository
    UserLocationVoucherExchangeHistoryRepository --> LocationVoucherEntity
```

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

    VoucherExchangeService->>VoucherExchangeService: mapToResponseDto(userVouchers)
    Note over VoucherExchangeService: Calculate isUsed, isExpired, isValid<br/>Transform location from voucher.location
    VoucherExchangeService-->>VoucherController: UserVoucherResponseDto[]
    VoucherController-->>Client: 200 OK
```

## Sequence Diagram: Use Voucher (Business Owner)

### Class Diagram: Use Voucher (Business Owner)

```mermaid
classDiagram
    class LocationMissionBusinessController {
        +useVoucher(voucherCode, user) Promise~void~
    }
    class VoucherExchangeService {
        +useVoucher(userId, voucherCode) Promise~void~
    }
    class UserLocationVoucherExchangeHistoryRepository {
        +findByUserVoucherCode(code) UserVoucherHistory
        +updateUsedAt(id, time) void
    }
    class LocationVoucherRepository {
        +findOne(id) Voucher
    }

    LocationMissionBusinessController --> VoucherExchangeService
    VoucherExchangeService --> UserLocationVoucherExchangeHistoryRepository
    VoucherExchangeService --> LocationVoucherRepository
```

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

    alt Voucher not found
        VoucherExchangeService-->>BusinessController: NotFoundException("Voucher code not found")
        BusinessController-->>Client: 404 Not Found
    else Voucher already used
        VoucherExchangeService-->>BusinessController: BadRequestException("Voucher already used")
        BusinessController-->>Client: 400 Bad Request
    end

    VoucherExchangeService->>VoucherRepository: findOne(voucherHistory.voucherId)
    VoucherRepository-->>VoucherExchangeService: voucher

    alt Voucher expired
        VoucherExchangeService-->>BusinessController: BadRequestException("Voucher expired")
        BusinessController-->>Client: 400 Bad Request
    end

    VoucherExchangeService->>VoucherHistoryRepository: updateUsedAt(voucherHistory.id, now())
    VoucherHistoryRepository-->>VoucherExchangeService: updated

    VoucherExchangeService-->>BusinessController: success
    BusinessController-->>Client: 200 OK
```

## Sequence Diagram: Get Free Available Vouchers

### Class Diagram: Get Free Available Vouchers

```mermaid
classDiagram
    class LocationVoucherUserController {
        +getFreeAvailableVouchers(query, user) Promise~Paginated~
    }
    class LocationVoucherService {
        +getFreeAvailableVouchers(query) Promise~Paginated~
    }
    class LocationVoucherRepository {
        +createQueryBuilder(alias) QueryBuilder
    }
    class Paginate {
        +paginate(query, qb, config) Paginated
    }
    class LocationVoucherEntity {
        +UUID id
        +UUID locationId
        +Integer pricePoint
        +Date startDate
        +Date endDate
        +Integer maxQuantity
    }

    LocationVoucherUserController --> LocationVoucherService
    LocationVoucherService --> LocationVoucherRepository
    LocationVoucherService --> Paginate
    LocationVoucherRepository --> LocationVoucherEntity
```

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

    VoucherService->>VoucherRepository: where('voucher.pricePoint = 0')
    VoucherService->>VoucherRepository: andWhere('voucher.startDate <= :now', {now})
    VoucherService->>VoucherRepository: andWhere('voucher.endDate >= :now', {now})
    VoucherService->>VoucherRepository: andWhere('voucher.maxQuantity > 0')

    VoucherService->>Paginate: paginate(query, queryBuilder, config)
    Note over Paginate: sortableColumns: createdAt, startDate, endDate<br/>searchableColumns: title, voucherCode<br/>filterableColumns: voucherType, locationId
    Paginate->>VoucherRepository: getMany()
    VoucherRepository-->>Paginate: vouchers[]
    Paginate-->>VoucherService: Paginated<Voucher>

    VoucherService-->>VoucherController: Paginated<VoucherResponseDto>
    VoucherController-->>Client: 200 OK
```
