## 21. Follows Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| follow_id | uuid |  | x | PK |  |
| follower_id | uuid |  |  | FK |  |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| entity_id | uuid |  |  |  |  |
| entity_type | varchar(50) |  |  |  |  |
