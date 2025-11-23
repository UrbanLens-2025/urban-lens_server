## 25. Location Analytics Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| id | uuid |  | x | PK |  |
| location_id | uuid |  | x | FK |  |
| average_rating | decimal(3,2) |  |  |  | default: 0 |
| created_at | timestamp with time zone |  |  |  |  |
| total_check_ins | bigint |  |  |  | default: 0 |
| total_posts | bigint |  |  |  | default: 0 |
| total_reviews | int |  |  |  | default: 0 |
| updated_at | timestamp with time zone |  |  |  |  |
