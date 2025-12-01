# Sequence Diagram Generation Rules

# Input
- Controller function in the app

# Output
- Mermaid charts sequence diagram

---

When generating sequence diagrams using Mermaid charts for controller functions, follow these requirements:

## Lifeline Structure

1. **Always start with**: `User` lifeline (no colon prefix)
2. **Second lifeline**: `Frontend` (no colon prefix)
3. **Controller and beyond**: All classes (controllers, services, repositories) must be prefixed with a colon `:`
   - Example: `:UserController`, `:UserService`, `:TransactionRepository`
4. **Always end with**: `Database` lifeline (no colon prefix)

## Message Formatting

1. **Number all messages** starting from 1, incrementing sequentially
2. **Request messages** (solid lines): Use `->` or `->>`
   - Format: `Number. Description of action`
   - Example: `1. View transaction`, `2. PUT /api/transaction/approve`
3. **Response messages** (dotted lines): Use `-->>`
   - Format: `Number. Return [description]`
   - Example: `5. Return transaction`, `28. Return success response`
4. **Final response to client**: Always end with "Return success response"
5. **Keep messages simple and descriptive** - explain what the caller is doing

## Activations

1. **Add activation boxes** (rectangles) to all lifelines using `activate` and `deactivate`
2. **Activate** a lifeline when it receives a message
3. **Deactivate** a lifeline when it completes its processing

## Message Scope

1. **Only map**:
   - Messages to other services/repositories
   - Self-validation messages (messages to self for validation logic)
2. **Do not map**:
   - Internal variable assignments
   - Simple data transformations
   - Logging statements

## Repository Pattern

1. **Repository lifelines** must call the `Database` lifeline
2. **Database operations** should be clearly labeled:
   - `Query [entity] by ID`
   - `Save [entity]`
   - `Update [entity]`
   - `Insert [entity]`
   - etc.

## Flow Pattern

Standard flow should follow:
```
User -> Frontend -> :Controller -> :Service -> :Repository -> Database
```

With responses flowing back:
```
Database -->> :Repository -->> :Service -->> :Controller -->> Frontend -->> User
```

## Example Structure

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant :ControllerName
    participant :ServiceName
    participant :RepositoryName
    participant Database

    User->>Frontend: 1. [User action description]
    activate Frontend
    Frontend->>:ControllerName: 2. [HTTP method] /api/endpoint
    activate :ControllerName
    :ControllerName->>:ServiceName: 3. [Method name]()
    activate :ServiceName
    :ServiceName->>:RepositoryName: 4. [Repository method]()
    activate :RepositoryName
    :RepositoryName->>Database: 5. Query [entity] by ID
    activate Database
    Database-->>:RepositoryName: 6. Return [entity]
    deactivate Database
    :RepositoryName-->>:ServiceName: 7. Return [entity]
    deactivate :RepositoryName
    :ServiceName-->>:ControllerName: 8. Return success response
    deactivate :ServiceName
    :ControllerName-->>Frontend: 9. Return success response
    deactivate :ControllerName
    Frontend-->>User: 10. Show success message
    deactivate Frontend
```

## Validation Messages

When validation occurs, show it as a self-message:
```
:ServiceName->>:ServiceName: X. Validate [condition]
```

## Alternative Flows (alt blocks)

When showing conditional logic (approve/reject, found/not found):
- Use `alt` blocks with clear labels
- Number messages sequentially even across branches
- Show all paths clearly

## Notes

- Keep the diagram focused on the main flow
- Show error paths only if they're significant to the business logic
- Use clear, concise message descriptions
- Maintain consistent numbering throughout the entire sequence

