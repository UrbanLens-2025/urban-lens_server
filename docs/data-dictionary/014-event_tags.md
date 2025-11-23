## 14. Event Tags Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| id | int |  | x | PK |  |
| event_id | uuid |  |  | FK |  |
| tag_id | int |  |  | FK |  |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| updated_at | timestamp with time zone |  |  |  | auto-generated |
