# Location Feature - Class & Sequence Diagrams

## Description

Mô tả domain Location: tạo địa điểm (public do user tạo, business do business owner tạo), xác thực category → tags, xem chi tiết địa điểm kèm tags và analytics cơ bản. Áp dụng chuẩn xác nhận ảnh đã upload nếu có.

## Class Diagram

```mermaid
classDiagram

    class LocationEntity {
        +UUID id
        +String name
        +String description
        +Decimal latitude
        +Decimal longitude
        +String addressLine
        +String addressLevel1
        +String addressLevel2
        +LocationOwnershipType ownershipType
        +UUID businessId
        +String[] imageUrl
        +Boolean isVisibleOnMap
        +Date createdAt
        +Date updatedAt
    }

    class BusinessEntity {
        +UUID id
        +UUID accountId
        +String name
        +String email
        +String phone
        +Boolean isActive
    }

    class TagEntity {
        +Integer id
        +String name
        +Boolean selectable
    }

    class TagCategoryEntity {
        +Integer id
        +String name
        +CategoryType[] applicableTypes
        +Map<tagId, weight> tagScoreWeights
    }

    class LocationTagEntity {
        +UUID id
        +UUID locationId
        +Integer tagId
    }

    class LocationAnalyticsEntity {
        +UUID id
        +UUID locationId
        +Integer totalReviews
        +Integer totalCheckins
        +Integer totalReacts
    }

    class CreatePublicLocationDto {
        +String name
        +String description
        +Decimal latitude
        +Decimal longitude
        +String addressLine
        +Integer[] categoryIds
        +String[] imageUrl
    }

    class ILocationManagementService {
        <<interface>>
        +createPublicLocation(dto) Promise~Location~
        +getLocationById(id) Promise~Location~
    }

    class LocationManagementService {
        -DataSource dataSource
        -IFileStorageService fileStorageService
        -mergeTagsWithCategories(categories) Integer[]
        +createPublicLocation(dto) Promise~Location~
        +getLocationById(id) Promise~Location~
    }

    class LocationManagementUserController {
        -ILocationManagementService locationService
        +createPublicLocation(dto, user) Promise~Location~
        +getLocationById(id) Promise~Location~
    }

    class IFileStorageService {
        <<interface>>
        +confirmUpload(urls, manager) Promise~void~
    }

    %% Relationships
    LocationEntity ||--o{ LocationTagEntity : "has"
    TagEntity ||--o{ LocationTagEntity : "applied as"
    TagCategoryEntity "many" o-- "many" TagEntity : "weights via tag_score_weights"
    LocationEntity "1" -- "1" LocationAnalyticsEntity : has
    BusinessEntity "1" -- "many" LocationEntity : owns (BUSINESS_OWNED)

    ILocationManagementService <|.. LocationManagementService
    LocationManagementUserController --> ILocationManagementService
    LocationManagementService --> IFileStorageService
```

## Sequence Diagram: Create Public Location

### Class Diagram: Create Public Location

```mermaid
classDiagram
    class LocationManagementUserController {
        +createPublicLocation(dto, user) Promise~Location~
    }
    class LocationManagementService {
        +createPublicLocation(dto) Promise~Location~
    }
    class TagCategoryRepository {
        +find(where) TagCategory[]
    }
    class TagRepository {
        +countSelectableTagsById(ids) number
    }
    class LocationRepository {
        +save(entity) Location
        +findOne(opts) Location
    }
    class LocationTagRepository {
        +persistEntities(locationId, tagIds) void
    }
    class IFileStorageService {
        <<interface>>
        +confirmUpload(urls, manager) Promise~void~
    }

    LocationManagementUserController --> LocationManagementService
    LocationManagementService --> TagCategoryRepository
    LocationManagementService --> TagRepository
    LocationManagementService --> LocationRepository
    LocationManagementService --> LocationTagRepository
    LocationManagementService --> IFileStorageService
```

```mermaid
sequenceDiagram
    participant Client
    participant Controller as LocationManagementUserController
    participant Service as LocationManagementService
    participant CategoryRepo as TagCategoryRepository
    participant TagRepo as TagRepository
    participant LocRepo as LocationRepository
    participant LocTagRepo as LocationTagRepository
    participant FileStorage as IFileStorageService

    Client->>Controller: POST /user/location/public (CreatePublicLocationDto)
    Controller->>Service: createPublicLocation(dto)

    alt imageUrl provided
        Service->>FileStorage: confirmUpload(imageUrl)
        FileStorage-->>Service: success
    end

    Service->>CategoryRepo: find({ id IN dto.categoryIds })
    CategoryRepo-->>Service: categories[]

    alt categories missing/invalid
        Service-->>Controller: BadRequestException
        Controller-->>Client: 400 Bad Request
    end

    Service->>TagRepo: countSelectableTagsById(finalTagIds from categories)
    TagRepo-->>Service: count

    alt count mismatch or zero
        Service-->>Controller: BadRequestException("invalid or zero tags")
        Controller-->>Client: 400 Bad Request
    end

    Service->>LocRepo: save(LocationEntity{ownershipType=PUBLIC_PLACE})
    LocRepo-->>Service: savedLocation

    Service->>LocTagRepo: persistEntities({locationId, tagIds})
    LocTagRepo-->>Service: done

    Service->>LocRepo: findOne({id, relations:['tags','tags.tag']})
    LocRepo-->>Service: locationWithTags

    Service-->>Controller: LocationResponseDto
    Controller-->>Client: 201 Created
```

## Sequence Diagram: Create Business Location

### Class Diagram: Create Business Location

```mermaid
classDiagram
    class LocationManagementBusinessController {
        +createBusinessLocation(dto, user) Promise~Location~
    }
    class LocationManagementService {
        +createBusinessLocation(dto, businessOwnerId) Promise~Location~
    }
    class TagCategoryRepository {
        +find(where) TagCategory[]
    }
    class TagRepository {
        +countSelectableTagsById(ids) number
    }
    class LocationRepository {
        +save(entity) Location
        +findOne(opts) Location
    }
    class LocationTagRepository {
        +persistEntities(locationId, tagIds) void
    }
    class IFileStorageService {
        <<interface>>
        +confirmUpload(urls, manager) Promise~void~
    }

    LocationManagementBusinessController --> LocationManagementService
    LocationManagementService --> TagCategoryRepository
    LocationManagementService --> TagRepository
    LocationManagementService --> LocationRepository
    LocationManagementService --> LocationTagRepository
    LocationManagementService --> IFileStorageService
```

```mermaid
sequenceDiagram
    participant Client
    participant Controller as LocationManagementBusinessController
    participant Service as LocationManagementService
    participant CategoryRepo as TagCategoryRepository
    participant TagRepo as TagRepository
    participant LocRepo as LocationRepository
    participant LocTagRepo as LocationTagRepository
    participant FileStorage as IFileStorageService

    Client->>Controller: POST /business/location (CreateBusinessLocationDto)
    Controller->>Service: createBusinessLocation(dto, businessOwnerId)

    alt imageUrl provided
        Service->>FileStorage: confirmUpload(imageUrl)
        FileStorage-->>Service: success
    end

    Service->>CategoryRepo: find({ id IN dto.categoryIds })
    CategoryRepo-->>Service: categories[]

    alt categories missing/invalid
        Service-->>Controller: BadRequestException
        Controller-->>Client: 400 Bad Request
    end

    Service->>TagRepo: countSelectableTagsById(finalTagIds from categories)
    TagRepo-->>Service: count

    alt count mismatch or zero
        Service-->>Controller: BadRequestException("invalid or zero tags")
        Controller-->>Client: 400 Bad Request
    end

    Note over Service: ownershipType = BUSINESS_OWNED<br/>businessId = from businessOwnerId
    Service->>LocRepo: save(LocationEntity{ownershipType=BUSINESS_OWNED, businessId})
    LocRepo-->>Service: savedLocation

    Service->>LocTagRepo: persistEntities({locationId, tagIds})
    LocTagRepo-->>Service: done

    Service->>LocRepo: findOne({id, relations:['tags','tags.tag']})
    LocRepo-->>Service: locationWithTags

    Service-->>Controller: LocationResponseDto
    Controller-->>Client: 201 Created
```

## Sequence Diagram: Get Location by Id

### Class Diagram: Get Location by Id

```mermaid
classDiagram
    class LocationManagementUserController {
        +getLocationById(id) Promise~Location~
    }
    class LocationManagementService {
        +getLocationById(id) Promise~Location~
    }
    class LocationRepository {
        +findOne(opts) Location
    }

    LocationManagementUserController --> LocationManagementService
    LocationManagementService --> LocationRepository
```

```mermaid
sequenceDiagram
    participant Client
    participant Controller as LocationManagementUserController
    participant Service as LocationManagementService
    participant LocRepo as LocationRepository

    Client->>Controller: GET /user/location/:id
    Controller->>Service: getLocationById(id)

    Service->>LocRepo: findOne({id, relations:['tags','tags.tag']})
    LocRepo-->>Service: location

    alt not found
        Service-->>Controller: NotFoundException
        Controller-->>Client: 404 Not Found
    end

    Service-->>Controller: LocationResponseDto
    Controller-->>Client: 200 OK
```
