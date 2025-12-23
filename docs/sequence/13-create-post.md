```mermaid
---
config:
  theme: redux
  look: classic
---
sequenceDiagram
    participant User
    participant CreatePostScreen as :CreatePostScreen
    participant PostController as :PostUserController
    participant PostService as :PostService
    participant PostRepo as :PostRepository
    participant Database

    User->>CreatePostScreen: 1. Submit post creation form
    activate CreatePostScreen
    CreatePostScreen->>PostController: 2. POST /user/post<br/>(CreatePostDto + JWT)
    activate PostController
    PostController->>PostService: 3. createPost()
    activate PostService


    PostService->>PostRepo: 4. save()
    activate PostRepo
    PostRepo->>Database: 5. INSERT INTO posts
    activate Database
    Database-->>PostRepo: 6. Return saved post
    deactivate Database
    PostRepo-->>PostService: 7. Return saved post
    deactivate PostRepo

    PostService-->>PostController: 8. Return PostResponseDto
    deactivate PostService
    PostController-->>CreatePostScreen: 9. Return PostResponseDto
    deactivate PostController
    CreatePostScreen-->>User: 10. Show success message
    deactivate CreatePostScreen
```

**Figure 13:** Sequence diagram illustrating the flow of creating a new post, including database operations for validation, post creation, analytics updates, and user profile counters.
