# Class Diagrams - Services Architecture

This directory contains class diagrams for all service modules in the Urban Lens server application. Each diagram shows the service layer architecture including controllers, service interfaces, service implementations, and repositories.

## Module Diagrams

1. [Post Module Services](./class-diagram-post-services.md)
   - Post and Comment management
   - Post reactions and analytics

2. [Gamification Module Services](./class-diagram-gamification-services.md)
   - Location missions and QR code scanning
   - Vouchers and rewards
   - User points and leaderboards

3. [Journey Module Services](./class-diagram-journey-services.md)
   - Journey planning (algorithmic and AI-powered)
   - Itinerary management

4. [Event Module Services](./class-diagram-event-services.md)
   - Event management and querying
   - Ticket orders and attendance

5. [Location Booking Module Services](./class-diagram-location-booking-services.md)
   - Location booking management
   - Availability and configuration

6. [Wallet Module Services](./class-diagram-wallet-services.md)
   - Wallet operations
   - External transactions
   - Payment gateway integration

7. [Account Module Services](./class-diagram-account-services.md)
   - User onboarding
   - Profile management
   - Follow and favorite locations

8. [Business Module Services](./class-diagram-business-services.md)
   - Location management
   - Check-in functionality
   - Location requests and analytics

## Diagram Conventions

- **Controllers**: Handle HTTP requests and delegate to services
- **Service Interfaces**: Define contracts for service implementations
- **Service Implementations**: Concrete service classes implementing interfaces
- **Repositories**: Data access layer for entities
- **Relationships**:
  - `-->` : Dependency (uses)
  - `<|..` : Implements interface

## Notes

- All diagrams use standard Mermaid class diagram syntax
- Services follow dependency injection patterns
- Repositories provide data access abstraction
- External services are shown as interfaces when applicable
