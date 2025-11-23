## 19. Favorite Locations Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| favorite_id | uuid |  | x | PK |  |
| account_id | uuid |  |  | FK |  |
| location_id | uuid |  |  | FK |  |
| created_at | timestamp with time zone |  |  |  | auto-generated |
