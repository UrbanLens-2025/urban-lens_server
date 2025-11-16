# Event Feature - Class & Sequence Diagrams

## Description

Mô tả domain Event: tạo sự kiện gắn với địa điểm hoặc business, quản lý tham gia (RSVP/Join), và liệt kê sự kiện sắp diễn ra. Kết nối với Account (organizer/participant) và Location.

## Class Diagram

```mermaid
classDiagram

    class EventEntity {
        +UUID id
        +String title
        +String description
        +Date startTime
        +Date endTime
        +UUID locationId
        +UUID organizerAccountId
        +String[] imageUrls
        +Boolean isPublic
        +Date createdAt
        +Date updatedAt
    }

    class EventParticipantEntity {
        +UUID id
        +UUID eventId
        +UUID accountId
        +Date joinedAt
        +Boolean checkedIn
    }

    class AccountEntity {
        +UUID id
        +String firstName
        +String lastName
        +String email
        +Role role
    }

    class LocationEntity {
        +UUID id
        +String name
        +Decimal latitude
        +Decimal longitude
        +String addressLine
    }

    class IEventService {
        <<interface>>
        +createEvent(dto, organizerId) Promise~Event~
        +joinEvent(eventId, accountId) Promise~void~
        +listUpcomingEvents(query) Promise~Paginated~
        +getEventById(id) Promise~Event~
    }

    class EventService {
        -EventRepository eventRepository
        -EventParticipantRepository eventParticipantRepository
        -LocationRepository locationRepository
        -IFileStorageService fileStorageService
        +createEvent(dto, organizerId) Promise~Event~
        +joinEvent(eventId, accountId) Promise~void~
        +listUpcomingEvents(query) Promise~Paginated~
        +getEventById(id) Promise~Event~
    }

    class EventUserController {
        -IEventService eventService
        +createEvent(dto, user) Promise~Event~
        +joinEvent(eventId, user) Promise~void~
        +listUpcomingEvents(query) Promise~Paginated~
        +getEventById(id) Promise~Event~
    }

    class IFileStorageService {
        <<interface>>
        +confirmUpload(urls, manager) Promise~void~
    }

    %% Relationships
    EventEntity ||--o{ EventParticipantEntity : "has participants"
    AccountEntity ||--o{ EventParticipantEntity : "joins"
    AccountEntity "1" -- "many" EventEntity : organizes
    LocationEntity "1" -- "many" EventEntity : hosts

    IEventService <|.. EventService
    EventUserController --> IEventService
    EventService --> IFileStorageService
```

## Sequence Diagram: Create Event

### Class Diagram: Create Event

```mermaid
classDiagram
    class EventUserController {
        +createEvent(dto, user) Promise~Event~
    }
    class EventService {
        +createEvent(dto, organizerId) Promise~Event~
    }
    class EventRepository {
        +save(entity) Event
    }
    class LocationRepository {
        +findOne(id) Location
    }
    class IFileStorageService {
        <<interface>>
        +confirmUpload(urls, manager) Promise~void~
    }

    EventUserController --> EventService
    EventService --> EventRepository
    EventService --> LocationRepository
    EventService --> IFileStorageService
```

```mermaid
sequenceDiagram
    participant Client
    participant EventController as EventUserController
    participant EventService
    participant EventRepository
    participant LocationRepository
    participant FileStorage as IFileStorageService

    Client->>EventController: POST /user/event (CreateEventDto)
    EventController->>EventService: createEvent(dto, organizerId)

    alt imageUrls provided
        EventService->>FileStorage: confirmUpload(imageUrls)
        FileStorage-->>EventService: success
    end

    EventService->>LocationRepository: findOne(dto.locationId)
    LocationRepository-->>EventService: location

    alt location not found
        EventService-->>EventController: NotFoundException
        EventController-->>Client: 404 Not Found
    end

    EventService->>EventRepository: save(EventEntity{organizerAccountId})
    EventRepository-->>EventService: event

    EventService-->>EventController: EventResponseDto
    EventController-->>Client: 201 Created
```

## Sequence Diagram: Join Event

### Class Diagram: Join Event

```mermaid
classDiagram
    class EventUserController {
        +joinEvent(eventId, user) Promise~void~
    }
    class EventService {
        +joinEvent(eventId, accountId) Promise~void~
    }
    class EventRepository {
        +findOne(id) Event
    }
    class EventParticipantRepository {
        +findOne(where) EventParticipant
        +save(entity) EventParticipant
    }

    EventUserController --> EventService
    EventService --> EventRepository
    EventService --> EventParticipantRepository
```

```mermaid
sequenceDiagram
    participant Client
    participant EventController as EventUserController
    participant EventService
    participant EventRepository
    participant ParticipantRepository as EventParticipantRepository

    Client->>EventController: POST /user/event/:eventId/join
    EventController->>EventService: joinEvent(eventId, accountId)

    EventService->>EventRepository: findOne(eventId)
    EventRepository-->>EventService: event

    alt event not found
        EventService-->>EventController: NotFoundException
        EventController-->>Client: 404 Not Found
    end

    EventService->>ParticipantRepository: findOne({eventId, accountId})
    ParticipantRepository-->>EventService: existing

    alt already joined
        EventService-->>EventController: BadRequestException("Already joined")
        EventController-->>Client: 400 Bad Request
    end

    EventService->>ParticipantRepository: save(EventParticipantEntity{eventId, accountId})
    ParticipantRepository-->>EventService: participant

    EventService-->>EventController: success
    EventController-->>Client: 200 OK
```

## Sequence Diagram: List Upcoming Events

### Class Diagram: List Upcoming Events

```mermaid
classDiagram
    class EventUserController {
        +listUpcomingEvents(query) Promise~Paginated~
    }
    class EventService {
        +listUpcomingEvents(query) Promise~Paginated~
    }
    class EventRepository {
        +createQueryBuilder(alias) QueryBuilder
    }
    class Paginate {
        +paginate(query, qb, config) Paginated
    }

    EventUserController --> EventService
    EventService --> EventRepository
    EventService --> Paginate
```

```mermaid
sequenceDiagram
    participant Client
    participant EventController as EventUserController
    participant EventService
    participant EventRepository
    participant Paginate

    Client->>EventController: GET /user/event/upcoming?page=1&limit=10
    EventController->>EventService: listUpcomingEvents(query)

    EventService->>EventRepository: createQueryBuilder('event')
    EventService->>EventRepository: where('event.startTime >= :now', {now})
    EventService->>EventRepository: andWhere('event.isPublic = true')

    EventService->>Paginate: paginate(query, queryBuilder, config)
    Paginate->>EventRepository: getMany()
    EventRepository-->>Paginate: events[]
    Paginate-->>EventService: Paginated<Event>

    EventService-->>EventController: Paginated<EventResponseDto>
    EventController-->>Client: 200 OK
```
