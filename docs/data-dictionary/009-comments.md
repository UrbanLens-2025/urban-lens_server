## 9. Comments Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| comment_id | text |  | x | PK |  |
| author_id | uuid | x |  | FK |  |
| post_id | uuid | x |  | FK |  |
| content | text |  |  |  |  |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| updated_at | timestamp with time zone |  |  |  | auto-generated |
