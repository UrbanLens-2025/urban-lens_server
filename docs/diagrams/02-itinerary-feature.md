# Itinerary Feature - Class & Sequence Diagrams

## Class Diagram

```mermaid
classDiagram
    class ItineraryEntity {
        +UUID id
        +UUID userId
        +String title
        +String description
        +Date startDate
        +Date endDate
        +ItinerarySource source
        +AIMetadata aiMetadata
        +String[] album
        +String thumbnailUrl
        +UUID[] locationWishlist
        +Date createdAt
        +Date updatedAt
    }

    class AccountEntity {
        +UUID id
        +String firstName
        +String lastName
        +String email
        +String avatarUrl
        +Boolean hasOnboarded
    }

    class ItineraryLocationEntity {
        +UUID id
        +UUID itineraryId
        +UUID locationId
        +Integer order
        +String notes
    }

    class LocationEntity {
        +UUID id
        +String name
        +String description
        +Decimal latitude
        +Decimal longitude
        +String addressLine
        +String[] imageUrl
    }

    class IItineraryService {
        <<interface>>
        +createItinerary(userId, dto) Promise~Itinerary~
        +createItineraryFromAI(userId, dto) Promise~Itinerary~
        +updateItinerary(id, userId, dto) Promise~Itinerary~
        +getItineraryById(id, userId) Promise~Itinerary~
        +getMyItineraries(userId, query) Promise~Paginated~
        +deleteItinerary(id, userId) Promise~void~
    }

    class ItineraryService {
        -ItineraryRepository itineraryRepository
        -ItineraryLocationRepository itineraryLocationRepository
        -DataSource dataSource
        -IFileStorageService fileStorageService
        +createItinerary(userId, dto) Promise~Itinerary~
        +createItineraryFromAI(userId, dto) Promise~Itinerary~
        +updateItinerary(id, userId, dto) Promise~Itinerary~
        +getItineraryById(id, userId) Promise~Itinerary~
        +getMyItineraries(userId, query) Promise~Paginated~
        +deleteItinerary(id, userId) Promise~void~
    }

    class ItineraryUserController {
        -IItineraryService itineraryService
        +createItinerary(dto, user) Promise~Itinerary~
        +createItineraryFromAI(dto, user) Promise~Itinerary~
        +updateItinerary(id, dto, user) Promise~Itinerary~
        +getItineraryById(id, user) Promise~Itinerary~
        +getMyItineraries(query, user) Promise~Paginated~
        +deleteItinerary(id, user) Promise~void~
    }

    class IFileStorageService {
        <<interface>>
        +confirmUpload(urls, manager) Promise~void~
    }

    class OllamaService {
        +generateItinerary(prompt) Promise~AIMetadata~
    }

    %% Relationships
    AccountEntity ||--o{ ItineraryEntity : "creates"
    ItineraryEntity ||--o{ ItineraryLocationEntity : "contains"
    ItineraryLocationEntity }o--|| LocationEntity : "references"

    IItineraryService <|.. ItineraryService
    ItineraryUserController --> IItineraryService
    ItineraryService --> IFileStorageService
    ItineraryService --> OllamaService
```

## Sequence Diagram: Create Itinerary (Manual)

### Class Diagram: Create Itinerary (Manual)

```mermaid
classDiagram
    class ItineraryUserController {
        +createItinerary(dto, user) Promise~Itinerary~
    }
    class ItineraryService {
        +createItinerary(userId, dto) Promise~Itinerary~
    }
    class IFileStorageService {
        <<interface>>
        +confirmUpload(urls, manager) Promise~void~
    }
    class DataSource {
        +transaction(cb) Promise~T~
        +create(entity) any
        +save(entity) any
    }
    class ItineraryRepository {
        +findOne(opts) Itinerary
    }
    class ItineraryLocationRepository {
        +save(list) ItineraryLocation[]
    }
    class ItineraryEntity {
        +UUID id
        +String[] album
        +String thumbnailUrl
        +UUID[] locationWishlist
        +ItinerarySource source
    }
    class ItineraryLocationEntity {
        +UUID id
        +UUID itineraryId
        +UUID locationId
        +Integer order
    }

    ItineraryUserController --> ItineraryService
    ItineraryService --> IFileStorageService
    ItineraryService --> DataSource
    ItineraryService --> ItineraryRepository
    ItineraryService --> ItineraryLocationRepository
    DataSource --> ItineraryEntity
    ItineraryLocationRepository --> ItineraryLocationEntity
```

```mermaid
sequenceDiagram
    participant Client
    participant ItineraryController as ItineraryUserController
    participant ItineraryService
    participant FileStorageService as IFileStorageService
    participant DataSource
    participant ItineraryRepository

    Client->>ItineraryController: POST /user/itinerary (CreateItineraryDto)
    ItineraryController->>ItineraryService: createItinerary(userId, dto)

    ItineraryService->>DataSource: transaction()

    alt Thumbnail URL provided
        ItineraryService->>FileStorageService: confirmUpload([thumbnailUrl])
        FileStorageService-->>ItineraryService: success
    end

    ItineraryService->>DataSource: create(ItineraryEntity)
    Note over DataSource: album = []<br/>thumbnailUrl = dto.thumbnailUrl<br/>source = MANUAL
    ItineraryService->>DataSource: save(itinerary)
    DataSource-->>ItineraryService: savedItinerary

    alt Locations provided
        loop For each location
            ItineraryService->>DataSource: create(ItineraryLocationEntity)
            Note over DataSource: order, notes
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

## Sequence Diagram: Create Itinerary from AI

### Class Diagram: Create Itinerary from AI

```mermaid
classDiagram
    class ItineraryUserController {
        +createItineraryFromAI(dto, user) Promise~Itinerary~
    }
    class ItineraryService {
        +createItineraryFromAI(userId, dto) Promise~Itinerary~
    }
    class OllamaService {
        +generateItinerary(prompt) Promise~AIMetadata~
    }
    class IFileStorageService {
        <<interface>>
        +confirmUpload(urls, manager) Promise~void~
    }
    class DataSource {
        +transaction(cb) Promise~T~
        +create(entity) any
        +save(entity) any
    }
    class ItineraryRepository {
        +findOne(opts) Itinerary
    }
    class ItineraryLocationRepository {
        +save(list) ItineraryLocation[]
    }
    class ItineraryEntity {
        +UUID id
        +AIMetadata aiMetadata
        +String[] album
        +String thumbnailUrl
        +ItinerarySource source
    }

    ItineraryUserController --> ItineraryService
    ItineraryService --> OllamaService
    ItineraryService --> IFileStorageService
    ItineraryService --> DataSource
    ItineraryService --> ItineraryRepository
    ItineraryService --> ItineraryLocationRepository
```

```mermaid
sequenceDiagram
    participant Client
    participant ItineraryController as ItineraryUserController
    participant ItineraryService
    participant OllamaService
    participant FileStorageService as IFileStorageService
    participant DataSource
    participant ItineraryRepository

    Client->>ItineraryController: POST /user/itinerary/ai (CreateItineraryFromAIDto)
    ItineraryController->>ItineraryService: createItineraryFromAI(userId, dto)

    ItineraryService->>DataSource: transaction()

    ItineraryService->>OllamaService: generateItinerary(dto.prompt)
    OllamaService-->>ItineraryService: aiMetadata (reasoning, tips)

    alt Thumbnail URL provided
        ItineraryService->>FileStorageService: confirmUpload([thumbnailUrl])
        FileStorageService-->>ItineraryService: success
    end

    ItineraryService->>DataSource: create(ItineraryEntity)
    Note over DataSource: source = AI<br/>aiMetadata = {reasoning, tips, prompt}<br/>album = []
    ItineraryService->>DataSource: save(itinerary)
    DataSource-->>ItineraryService: savedItinerary

    alt Location IDs provided
        loop For each locationId
            ItineraryService->>DataSource: create(ItineraryLocationEntity)
            Note over DataSource: order = index + 1
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

## Sequence Diagram: Update Itinerary Album

### Class Diagram: Update Itinerary Album

```mermaid
classDiagram
    class ItineraryUserController {
        +updateItinerary(id, dto, user) Promise~Itinerary~
    }
    class ItineraryService {
        +updateItinerary(id, userId, dto) Promise~Itinerary~
    }
    class IFileStorageService {
        <<interface>>
        +confirmUpload(urls, manager) Promise~void~
    }
    class DataSource {
        +transaction(cb) Promise~T~
        +update(entity, data) any
    }
    class ItineraryRepository {
        +findOne(opts) Itinerary
    }
    class ItineraryEntity {
        +UUID id
        +String[] album
        +String thumbnailUrl
        +UUID[] locationWishlist
    }

    ItineraryUserController --> ItineraryService
    ItineraryService --> IFileStorageService
    ItineraryService --> DataSource
    ItineraryService --> ItineraryRepository
    ItineraryRepository --> ItineraryEntity
```

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
    else Itinerary owner != userId
        ItineraryService-->>ItineraryController: ForbiddenException
        ItineraryController-->>Client: 403 Forbidden
    end

    alt Album provided
        ItineraryService->>FileStorageService: confirmUpload(album)
        Note over FileStorageService: Verify images are used
        FileStorageService-->>ItineraryService: success
    end

    alt Thumbnail URL provided
        ItineraryService->>FileStorageService: confirmUpload([thumbnailUrl])
        FileStorageService-->>ItineraryService: success
    end

    ItineraryService->>DataSource: update(ItineraryEntity, dto)
    Note over DataSource: Update album, thumbnailUrl, locationWishlist, etc.
    DataSource-->>ItineraryService: updated

    ItineraryService->>ItineraryRepository: findOne(with relations)
    ItineraryRepository-->>ItineraryService: updatedItinerary

    ItineraryService-->>DataSource: commit()
    ItineraryService-->>ItineraryController: ItineraryResponseDto
    ItineraryController-->>Client: 200 OK
```
